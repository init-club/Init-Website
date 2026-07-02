import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ClipboardX, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { supabase } from '../supabaseClient';
import type { Form } from '../types/form';
import FormRenderer from '../components/forms/renderer/FormRenderer';
import { fetchPublicFormBySlug } from '../utils/fetchers';

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadForm = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPublicFormBySlug(slug);

        if (!data) {
          throw new Error('Form not found or unavailable');
        }

        // Check if form is active / published
        if (data.status !== 'published') {
          throw new Error('This form is currently closed or in draft mode');
        }

        // Check schedule windows
        const now = new Date();
        const settings = data.settings || {};
        
        if (settings.open_at && new Date(settings.open_at) > now) {
          throw new Error(`This form is not open yet. It will open at ${new Date(settings.open_at).toLocaleString()}`);
        }

        if (settings.close_at && new Date(settings.close_at) < now) {
          throw new Error('This form is now closed and no longer accepting responses');
        }

        setForm(data);
      } catch (err: any) {
        console.error('Error fetching public form:', err);
        setError(err.message || 'Form not found');
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [slug]);

  const handleSubmitResponse = async (answers: Record<string, any>) => {
    if (!form) return;
    setIsSubmitting(true);
    try {
      // Collect optional respondent data if they are authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      let respondent: any = {};
      if (session?.user) {
        respondent.auth_user_id = session.user.id;
        respondent.email = session.user.email;
        
        // Lookup user profile name
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('auth_user_id', session.user.id)
          .single();
        if (profile) respondent.name = profile.name;
      }

      // Collect client metadata
      const metadata = {
        user_agent: navigator.userAgent,
        submitted_from: window.location.href
      };

      const { error: insertError } = await supabase
        .from('form_responses')
        .insert({
          form_id: form.id,
          answers,
          respondent,
          metadata
        });

      if (insertError) throw insertError;

      // Clean answers cache from local sessionStorage to prevent double submit refresh errors
      sessionStorage.setItem(`form_submitted_${form.id}`, 'true');

      // Navigate to success page
      navigate(`/forms/${form.slug}/success`, {
        state: {
          successMessage: form.settings.success_message,
          redirectUrl: form.settings.redirect_url,
          allowMultiple: form.settings.allow_multiple_responses
        }
      });
    } catch (err: any) {
      console.error('Error submitting response:', err);
      alert(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-24 pb-16 px-4">
        {/* Background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-zinc-500 text-sm font-mono uppercase tracking-wider">Loading Form Details</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8">
              <ClipboardX className="mx-auto text-zinc-700 mb-4" size={48} />
              <h2 className="text-xl font-bold text-zinc-300 font-heading mb-2">Form Unavailable</h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md mx-auto">{error}</p>
            </div>
          ) : form ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Form Info Card */}
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6">
                <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight mb-2">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-zinc-400 text-sm leading-relaxed">{form.description}</p>
                )}
              </div>

              {/* Form Input fields */}
              <FormRenderer
                fields={form.fields}
                onSubmit={handleSubmitResponse}
                isSubmitting={isSubmitting}
                showProgressBar={form.settings.show_progress_bar}
              />
            </motion.div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
