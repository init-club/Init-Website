import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBlogReview from '../../components/AdminBlogReview';
import { supabase } from '../../supabaseClient';
import { Navbar } from '../../components/Navbar';

export default function BlogsAdminPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                navigate('/');
                return;
            }

            // Check role
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('auth_user_id', session.user.id)
                .single();

            if (error || !data || (data.role !== 'admin' && data.role !== 'semi_admin')) {
                navigate('/'); // Redirect non-admins
                return;
            }

            setIsAdmin(true);
            setIsLoading(false);
        };

        checkAdmin();
    }, [navigate]);

    if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    if (!isAdmin) return null;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-black pt-20">
                {/* We reuse the AdminBlogReview component, forcing it open */}
                <AdminBlogReview isOpen={true} onClose={() => navigate('/blogs')} />
            </div>
        </>
    );
}
