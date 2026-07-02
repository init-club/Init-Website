ALTER TABLE "public"."forms"
  ADD COLUMN IF NOT EXISTS "revision" integer DEFAULT 1 NOT NULL;

CREATE TABLE IF NOT EXISTS "public"."form_items" (
  "form_id" uuid NOT NULL,
  "item_id" text NOT NULL,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "required" boolean DEFAULT false NOT NULL,
  "position" integer NOT NULL,
  "config" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "form_items_pk" PRIMARY KEY ("form_id", "item_id"),
  CONSTRAINT "form_items_kind_check" CHECK ("kind" IN ('text', 'email', 'number', 'textarea', 'select', 'radio', 'multiselect', 'checkbox', 'date', 'rating', 'section')),
  CONSTRAINT "form_items_position_non_negative" CHECK ("position" >= 0)
);

CREATE TABLE IF NOT EXISTS "public"."form_item_options" (
  "form_id" uuid NOT NULL,
  "item_id" text NOT NULL,
  "option_id" text NOT NULL,
  "label" text NOT NULL,
  "position" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "form_item_options_pk" PRIMARY KEY ("form_id", "item_id", "option_id"),
  CONSTRAINT "form_item_options_position_non_negative" CHECK ("position" >= 0)
);

ALTER TABLE "public"."form_items"
  ADD CONSTRAINT "form_items_form_id_forms_id_fk"
  FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE CASCADE;

ALTER TABLE "public"."form_item_options"
  ADD CONSTRAINT "form_item_options_form_item_fk"
  FOREIGN KEY ("form_id", "item_id") REFERENCES "public"."form_items"("form_id", "item_id") ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_form_items_form_position"
  ON "public"."form_items" ("form_id", "position");

CREATE INDEX IF NOT EXISTS "idx_form_items_form_kind"
  ON "public"."form_items" ("form_id", "kind");

CREATE UNIQUE INDEX IF NOT EXISTS "idx_form_item_options_item_position"
  ON "public"."form_item_options" ("form_id", "item_id", "position");

CREATE INDEX IF NOT EXISTS "idx_form_item_options_item"
  ON "public"."form_item_options" ("form_id", "item_id");

ALTER TABLE "public"."form_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."form_item_options" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access on form items" ON "public"."form_items";
CREATE POLICY "Admin full access on form items"
  ON "public"."form_items" FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on form item options" ON "public"."form_item_options";
CREATE POLICY "Admin full access on form item options"
  ON "public"."form_item_options" FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Public read published form items" ON "public"."form_items";
CREATE POLICY "Public read published form items"
  ON "public"."form_items" FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.forms
      WHERE forms.id = form_items.form_id
        AND forms.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Public read published form item options" ON "public"."form_item_options";
CREATE POLICY "Public read published form item options"
  ON "public"."form_item_options" FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.forms
      WHERE forms.id = form_item_options.form_id
        AND forms.status = 'published'
    )
  );

INSERT INTO "public"."form_items" (
  "form_id",
  "item_id",
  "kind",
  "title",
  "description",
  "required",
  "position",
  "config"
)
SELECT
  f.id,
  COALESCE(NULLIF(field->>'id', ''), 'legacy-item-' || (ord::text)),
  COALESCE(field->>'type', 'text'),
  COALESCE(NULLIF(field->>'label', ''), 'Untitled Field'),
  NULLIF(field->>'helpText', ''),
  COALESCE((field->>'required')::boolean, false),
  COALESCE((field->>'order')::integer, ord - 1),
  jsonb_strip_nulls(
    jsonb_build_object(
      'placeholder', NULLIF(field->>'placeholder', ''),
      'scale', CASE WHEN field ? 'scale' THEN field->'scale' ELSE NULL END,
      'validation', CASE
        WHEN field ? 'validation' AND field->'validation' <> '{}'::jsonb THEN field->'validation'
        ELSE NULL
      END
    )
  )
FROM "public"."forms" AS f
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(f.fields, '[]'::jsonb)) WITH ORDINALITY AS items(field, ord)
ON CONFLICT ("form_id", "item_id") DO NOTHING;

INSERT INTO "public"."form_item_options" (
  "form_id",
  "item_id",
  "option_id",
  "label",
  "position"
)
SELECT
  f.id,
  COALESCE(NULLIF(field->>'id', ''), 'legacy-item-' || (field_ord::text)),
  COALESCE(NULLIF(opt->>'id', ''), COALESCE(NULLIF(field->>'id', ''), 'legacy-item-' || (field_ord::text)) || ':opt:' || ((opt_ord - 1)::text)),
  CASE
    WHEN jsonb_typeof(opt) = 'string' THEN trim(both '"' FROM opt::text)
    ELSE COALESCE(NULLIF(opt->>'label', ''), NULLIF(opt->>'value', ''), NULLIF(opt->>'text', ''))
  END,
  opt_ord - 1
FROM "public"."forms" AS f
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(f.fields, '[]'::jsonb)) WITH ORDINALITY AS items(field, field_ord)
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(field->'options', '[]'::jsonb)) WITH ORDINALITY AS opts(opt, opt_ord)
WHERE COALESCE(field->>'type', '') IN ('select', 'radio', 'multiselect')
  AND CASE
    WHEN jsonb_typeof(opt) = 'string' THEN trim(both '"' FROM opt::text)
    ELSE COALESCE(NULLIF(opt->>'label', ''), NULLIF(opt->>'value', ''), NULLIF(opt->>'text', ''))
  END IS NOT NULL
ON CONFLICT ("form_id", "item_id", "option_id") DO NOTHING;

UPDATE "public"."forms"
SET "fields" = '[]'::jsonb
WHERE COALESCE(jsonb_array_length("fields"), 0) > 0;

CREATE OR REPLACE FUNCTION "public"."get_form_definition"("p_form_id" uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  "result" jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can read form definitions'
      USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'id', f.id,
    'slug', f.slug,
    'title', f.title,
    'description', f.description,
    'status', f.status,
    'settings', COALESCE(f.settings, '{}'::jsonb),
    'created_by', f.created_by,
    'created_at', f.created_at,
    'updated_at', f.updated_at,
    'revision', f.revision,
    'fields', COALESCE((
      SELECT jsonb_agg(
        jsonb_strip_nulls(
          jsonb_build_object(
            'id', fi.item_id,
            'type', fi.kind,
            'label', fi.title,
            'helpText', fi.description,
            'required', fi.required,
            'order', fi.position,
            'placeholder', NULLIF(fi.config->>'placeholder', ''),
            'scale', CASE WHEN fi.kind = 'rating' THEN fi.config->'scale' ELSE NULL END,
            'validation', CASE
              WHEN fi.config ? 'validation' AND fi.config->'validation' <> '{}'::jsonb THEN fi.config->'validation'
              ELSE NULL
            END,
            'options', CASE
              WHEN fi.kind IN ('select', 'radio', 'multiselect') THEN COALESCE((
                SELECT jsonb_agg(fio.label ORDER BY fio.position)
                FROM public.form_item_options AS fio
                WHERE fio.form_id = fi.form_id
                  AND fio.item_id = fi.item_id
              ), '[]'::jsonb)
              ELSE NULL
            END
          )
        )
        ORDER BY fi.position
      )
      FROM public.form_items AS fi
      WHERE fi.form_id = f.id
    ), '[]'::jsonb)
  )
  INTO "result"
  FROM public.forms AS f
  WHERE f.id = p_form_id;

  RETURN "result";
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_public_form_definition"("p_slug" text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  "result" jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', f.id,
    'slug', f.slug,
    'title', f.title,
    'description', f.description,
    'status', f.status,
    'settings', COALESCE(f.settings, '{}'::jsonb),
    'created_by', f.created_by,
    'created_at', f.created_at,
    'updated_at', f.updated_at,
    'revision', f.revision,
    'fields', COALESCE((
      SELECT jsonb_agg(
        jsonb_strip_nulls(
          jsonb_build_object(
            'id', fi.item_id,
            'type', fi.kind,
            'label', fi.title,
            'helpText', fi.description,
            'required', fi.required,
            'order', fi.position,
            'placeholder', NULLIF(fi.config->>'placeholder', ''),
            'scale', CASE WHEN fi.kind = 'rating' THEN fi.config->'scale' ELSE NULL END,
            'validation', CASE
              WHEN fi.config ? 'validation' AND fi.config->'validation' <> '{}'::jsonb THEN fi.config->'validation'
              ELSE NULL
            END,
            'options', CASE
              WHEN fi.kind IN ('select', 'radio', 'multiselect') THEN COALESCE((
                SELECT jsonb_agg(fio.label ORDER BY fio.position)
                FROM public.form_item_options AS fio
                WHERE fio.form_id = fi.form_id
                  AND fio.item_id = fi.item_id
              ), '[]'::jsonb)
              ELSE NULL
            END
          )
        )
        ORDER BY fi.position
      )
      FROM public.form_items AS fi
      WHERE fi.form_id = f.id
    ), '[]'::jsonb)
  )
  INTO "result"
  FROM public.forms AS f
  WHERE f.slug = lower(trim(p_slug))
    AND f.status = 'published';

  RETURN "result";
END;
$$;

CREATE OR REPLACE FUNCTION "public"."list_forms_overview"()
RETURNS TABLE (
  "id" uuid,
  "slug" text,
  "title" text,
  "description" text,
  "status" text,
  "updated_at" timestamp with time zone,
  "response_count" bigint,
  "field_count" bigint,
  "revision" integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can list forms'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    f.id,
    f.slug,
    f.title,
    f.description,
    f.status,
    f.updated_at,
    COALESCE(fr.response_count, 0) AS response_count,
    COALESCE(fi.field_count, 0) AS field_count,
    f.revision
  FROM public.forms AS f
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint AS response_count
    FROM public.form_responses
    WHERE form_responses.form_id = f.id
  ) AS fr ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint AS field_count
    FROM public.form_items
    WHERE form_items.form_id = f.id
      AND form_items.kind <> 'section'
  ) AS fi ON true
  ORDER BY f.updated_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."save_form_definition"(
  "p_form_id" uuid DEFAULT NULL,
  "p_title" text DEFAULT NULL,
  "p_description" text DEFAULT NULL,
  "p_slug" text DEFAULT NULL,
  "p_status" text DEFAULT 'draft',
  "p_settings" jsonb DEFAULT '{}'::jsonb,
  "p_created_by" uuid DEFAULT NULL,
  "p_items" jsonb DEFAULT '[]'::jsonb,
  "p_expected_revision" integer DEFAULT NULL
)
RETURNS TABLE (
  "id" uuid,
  "revision" integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  "v_form_id" uuid;
  "v_revision" integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can save forms'
      USING ERRCODE = '42501';
  END IF;

  IF p_title IS NULL OR btrim(p_title) = '' THEN
    RAISE EXCEPTION 'Form title is required';
  END IF;

  IF p_slug IS NULL OR btrim(p_slug) = '' THEN
    RAISE EXCEPTION 'Form slug is required';
  END IF;

  IF p_form_id IS NULL THEN
    INSERT INTO public.forms (
      id,
      slug,
      title,
      description,
      status,
      settings,
      fields,
      created_by,
      updated_at,
      revision
    )
    VALUES (
      gen_random_uuid(),
      lower(trim(p_slug)),
      btrim(p_title),
      NULLIF(btrim(COALESCE(p_description, '')), ''),
      COALESCE(p_status, 'draft'),
      COALESCE(p_settings, '{}'::jsonb),
      '[]'::jsonb,
      p_created_by,
      now(),
      1
    )
    RETURNING forms.id, forms.revision
    INTO v_form_id, v_revision;
  ELSE
    UPDATE public.forms
    SET
      slug = lower(trim(p_slug)),
      title = btrim(p_title),
      description = NULLIF(btrim(COALESCE(p_description, '')), ''),
      status = COALESCE(p_status, 'draft'),
      settings = COALESCE(p_settings, '{}'::jsonb),
      fields = '[]'::jsonb,
      updated_at = now(),
      revision = forms.revision + 1
    WHERE forms.id = p_form_id
      AND (p_expected_revision IS NULL OR forms.revision = p_expected_revision)
    RETURNING forms.id, forms.revision
    INTO v_form_id, v_revision;

    IF v_form_id IS NULL THEN
      RAISE EXCEPTION 'Form revision conflict'
        USING ERRCODE = '40001';
    END IF;

    DELETE FROM public.form_items
    WHERE form_items.form_id = v_form_id;
  END IF;

  INSERT INTO public.form_items (
    form_id,
    item_id,
    kind,
    title,
    description,
    required,
    position,
    config
  )
  SELECT
    v_form_id,
    COALESCE(NULLIF(item->>'item_id', ''), 'item-' || ord::text),
    COALESCE(NULLIF(item->>'kind', ''), 'text'),
    COALESCE(NULLIF(item->>'title', ''), 'Untitled Field'),
    NULLIF(item->>'description', ''),
    COALESCE((item->>'required')::boolean, false),
    COALESCE((item->>'position')::integer, ord - 1),
    COALESCE(item->'config', '{}'::jsonb)
  FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) WITH ORDINALITY AS payload(item, ord);

  INSERT INTO public.form_item_options (
    form_id,
    item_id,
    option_id,
    label,
    position
  )
  SELECT
    v_form_id,
    COALESCE(NULLIF(item->>'item_id', ''), 'item-' || item_ord::text),
    COALESCE(NULLIF(item->>'item_id', ''), 'item-' || item_ord::text) || ':opt:' || (opt_ord - 1)::text,
    option_label,
    opt_ord - 1
  FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) WITH ORDINALITY AS payload(item, item_ord)
  CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(item->'options', '[]'::jsonb)) WITH ORDINALITY AS options(option_label, opt_ord)
  WHERE COALESCE(NULLIF(option_label, ''), '') <> '';

  RETURN QUERY
  SELECT v_form_id, v_revision;
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."get_form_definition"(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_public_form_definition"(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION "public"."list_forms_overview"() TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."save_form_definition"(uuid, text, text, text, text, jsonb, uuid, jsonb, integer) TO authenticated;
