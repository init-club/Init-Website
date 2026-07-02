import { mutate } from 'swr';
import { SWR_KEYS } from './swrKeys';

type InvalidateFormCachesOptions = {
  formId?: string | null;
  slug?: string | null;
};

export async function invalidateFormCaches({
  formId,
  slug,
}: InvalidateFormCachesOptions = {}) {
  const keys = new Set<string>();

  keys.add(SWR_KEYS.FORMS_LIST);

  if (formId) {
    keys.add(SWR_KEYS.form(formId));
    keys.add(SWR_KEYS.formResponses(formId));
  }

  if (slug) {
    keys.add(SWR_KEYS.publicForm(slug));
  }

  await Promise.all([...keys].map((key) => mutate(key)));
}
