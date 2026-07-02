import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Save, Eye, Settings, HelpCircle,
  AlertTriangle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { logAuditAction } from '../../utils/auditLogger';
import { invalidateFormCaches } from '../../utils/cacheInvalidation';
import type { FormField, FormSettings, FieldType } from '../../types/form';
import { generateSlug, createDefaultFields } from '../../utils/formUtils';
import { normalizeFormRecord, serializeFormFields } from '../../utils/formDefinition';

import FieldPalette from '../../components/forms/builder/FieldPalette';
import BuilderCanvas from '../../components/forms/builder/BuilderCanvas';
import FieldEditor from '../../components/forms/builder/FieldEditor';
import FormSettingsModal from '../../components/forms/builder/FormSettingsModal';
import FormPreviewModal from '../../components/forms/builder/FormPreviewModal';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const defaultSettings: FormSettings = {
  allow_multiple_responses: true,
  require_auth: false,
  open_at: null,
  close_at: null,
  success_message: 'Thank you for your response!',
  redirect_url: null,
  max_responses: null,
  show_progress_bar: true
};

export default function FormBuilderPage() {
  const { session, isAdmin, userProfile, isLoading: isAuthLoading } = useAuth();
  const { formId } = useParams<{ formId?: string }>();
  const navigate = useNavigate();
  
  const justCreatedRef = useRef(false);

  const isEditMode = Boolean(formId);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'closed'>('draft');
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings>(defaultSettings);
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [revision, setRevision] = useState<number | null>(null);

  // UI States
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isAuthLoading, navigate]);

  // Load existing form details
  useEffect(() => {
    if (!isEditMode || !isAdmin) {
      if (!isEditMode) {
        // Initialize default fields for new form
        setFields(createDefaultFields());
      }
      return;
    }

    if (justCreatedRef.current) {
      justCreatedRef.current = false;
      setIsPageLoading(false);
      return;
    }

    const loadForm = async () => {
      setIsPageLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_form_definition', {
            p_form_id: formId,
          });

        if (error) throw error;

        if (data) {
          const normalized = normalizeFormRecord(data);

          setTitle(normalized.title);
          setDescription(normalized.description || '');
          setSlug(normalized.slug);
          setStatus(normalized.status);
          setFields(normalized.fields || []);
          setSettings({
            ...defaultSettings,
            ...(normalized.settings || {})
          });
          setCreatedBy(normalized.created_by);
          setRevision(normalized.revision ?? null);
        }
      } catch (err: any) {
        console.error('Error loading form details:', err);
        addToast('error', 'Failed to load form config');
      } finally {
        setIsPageLoading(false);
      }
    };

    loadForm();
  }, [formId, isEditMode, isAdmin]);

  // Selected Field computation
  const selectedField = useMemo(() => {
    if (!selectedFieldId) return null;
    return fields.find(f => f.id === selectedFieldId) || null;
  }, [selectedFieldId, fields]);

  // Slug auto-generation on Title change in create mode
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode) {
      setSlug(generateSlug(val));
    }
  };

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: 'f-' + Math.random().toString(36).substring(2, 9),
      type,
      label: type === 'section' ? 'Section Title' : `Question ${fields.length + 1}`,
      required: false,
      order: fields.length
    };

    if (['select', 'radio', 'multiselect'].includes(type)) {
      newField.options = ['Option 1', 'Option 2'];
    }

    if (type === 'rating') {
      newField.scale = 5;
    }

    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleUpdateField = (updatedField: FormField) => {
    setFields(prev => prev.map(f => (f.id === updatedField.id ? updatedField : f)));
  };

  const handleDeleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id).map((f, idx) => ({ ...f, order: idx })));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  const handleDuplicateField = (id: string) => {
    const target = fields.find(f => f.id === id);
    if (!target) return;

    const duplicated: FormField = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'f-' + Math.random().toString(36).substring(2, 9),
      label: `${target.label} (Copy)`,
      order: fields.length
    };

    setFields(prev => [...prev, duplicated]);
    setSelectedFieldId(duplicated.id);
  };

  const handleSaveForm = async () => {
    if (!title.trim()) {
      addToast('error', 'Form Title is required');
      return;
    }
    if (!slug.trim()) {
      addToast('error', 'Form Slug is required');
      return;
    }

    setIsSaving(true);
    try {
      // Find current user's profile ID from global context
      const userRowId = createdBy || userProfile?.id || null;

      const formPayload = {
        p_form_id: isEditMode ? formId ?? null : null,
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_slug: slug.trim().toLowerCase(),
        p_status: status,
        p_settings: settings,
        p_created_by: userRowId,
        p_items: serializeFormFields(fields),
        p_expected_revision: isEditMode ? revision : null,
      };

      const { data, error } = await supabase
        .rpc('save_form_definition', formPayload)
        .single();

      if (error) throw error;

      const saveResult = (data || null) as { id?: string; revision?: number } | null;
      const savedFormId = saveResult?.id;
      const nextRevision = typeof saveResult?.revision === 'number' ? saveResult.revision : revision;
      setRevision(nextRevision ?? null);

      await invalidateFormCaches({
        formId: savedFormId || formId || null,
        slug: formPayload.p_slug,
      });

      if (isEditMode) {
        void logAuditAction(
          'UPDATE_FORM',
          'forms',
          savedFormId || formId || null,
          null,
          { title: formPayload.p_title, status: formPayload.p_status },
          userRowId
        );

        addToast('success', 'Form updated successfully!');
      } else {
        void logAuditAction(
          'CREATE_FORM',
          'forms',
          savedFormId || null,
          null,
          { title: formPayload.p_title, status: formPayload.p_status },
          userRowId
        );

        addToast('success', 'Form created successfully!');
        
        // Navigate to edit route of created form, skipping loadForm
        justCreatedRef.current = true;
        if (savedFormId) {
          navigate(`/admin/forms/${savedFormId}/edit`, { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Error saving form:', err);
      if (err?.code === '40001') {
        addToast('error', 'This form changed elsewhere. Reload it and try again.');
      } else {
        addToast('error', err.message || 'Failed to save form config');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isPageLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-24 pb-16 px-4">
        {/* Toast Container */}
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm shadow-xl backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-zinc-950/90 border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-950/90 border-red-500/30 text-red-400'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5">
            <div className="flex-1 min-w-0">
              <Link
                to="/admin/forms"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs mb-2 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Forms Manager
              </Link>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Form Title..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-zinc-800 focus:border-zinc-700 text-xl md:text-2xl font-black font-heading tracking-tight focus:outline-none w-full text-white placeholder-zinc-700 transition-colors"
                />
              </div>
              <input
                type="text"
                placeholder="Add form description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-zinc-800 focus:border-zinc-700 text-xs text-zinc-500 mt-1 focus:outline-none w-full text-zinc-400 placeholder-zinc-800 transition-colors"
              />
            </div>

            {/* Config & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Slug Input */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-mono text-zinc-600 select-none mr-1">/forms/</span>
                <input
                  type="text"
                  placeholder="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-cyan-400 focus:outline-none w-28"
                />
              </div>

              {/* Status */}
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger
                  className={`text-xs font-mono font-bold uppercase rounded-xl px-3 h-9 border cursor-pointer bg-zinc-900 focus:outline-none ${
                    status === 'published'
                      ? 'text-cyan-400 border-cyan-500/20'
                      : status === 'closed'
                      ? 'text-red-400 border-red-500/20'
                      : 'text-zinc-400 border-zinc-800'
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Settings Toggle */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
                title="Form Settings"
              >
                <Settings size={15} />
              </button>

              {/* Preview Toggle */}
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
                title="Preview"
              >
                <Eye size={15} />
              </button>

              {/* Save Trigger */}
              <button
                onClick={handleSaveForm}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-white/5"
              >
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {isEditMode ? 'Save Changes' : 'Create Form'}
              </button>
            </div>
          </div>

          {/* Builder Layout Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left elements palette */}
            <div className="md:col-span-3">
              <FieldPalette onAddField={handleAddField} />
            </div>

            {/* Canvas Area */}
            <div className="md:col-span-5">
              <BuilderCanvas
                fields={fields}
                onFieldsChange={setFields}
                selectedFieldId={selectedFieldId}
                onSelectField={setSelectedFieldId}
                onDeleteField={handleDeleteField}
                onDuplicateField={handleDuplicateField}
              />
            </div>

            {/* Right details editor */}
            <div className="md:col-span-4">
              <FieldEditor field={selectedField} onUpdateField={handleUpdateField} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Settings Modal */}
      <FormSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />

      {/* Preview Modal */}
      <FormPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title}
        description={description}
        fields={fields}
      />
    </>
  );
}
