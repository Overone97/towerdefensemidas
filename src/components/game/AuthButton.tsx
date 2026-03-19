import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthButton: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) console.error('Login error:', error);
    } catch (e) {
      console.error('Login failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Joueur';
    const avatar = user.user_metadata?.avatar_url;
    return (
      <div className="flex items-center gap-1.5">
        {avatar && (
          <img src={avatar} alt="" className="w-5 h-5 rounded-full" />
        )}
        <span className="text-[10px] text-muted-foreground font-mono max-w-[60px] truncate">{name}</span>
        <button
          onClick={handleLogout}
          className="text-[10px] px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground hover:bg-accent transition-colors"
        >
          ↪
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors bg-muted/70 text-muted-foreground hover:bg-accent disabled:opacity-50"
    >
      {loading ? '...' : '🔐 Connexion'}
    </button>
  );
};

export default AuthButton;
