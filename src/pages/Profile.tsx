import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building, Briefcase, Camera, Bell, Lock, Shield, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import type { UserProfile } from '../types';

interface UserSettings {
  email_notifications: boolean;
  notification_frequency: 'instant' | 'daily' | 'weekly';
  two_factor_enabled: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    notification_frequency: 'daily',
    two_factor_enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing'>('profile');
  const [saving, setSaving] = useState(false);
  const [fallbackUser, setFallbackUser] = useState<any>(null);

  useEffect(() => {
    // Check for fallback authentication
    const storedUser = localStorage.getItem('fallback_auth_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setFallbackUser(parsedUser);
        // Now that we have the fallback user, attempt to load the profile
        loadProfile(parsedUser);
      } catch (e) {
        console.error('Error parsing fallback user in Profile:', e);
        localStorage.removeItem('fallback_auth_user');
        // Still try to load the profile with standard auth
        loadProfile();
      }
    } else {
      // No fallback user, try standard auth
      loadProfile();
    }
  }, []);

  const loadProfile = async (fallbackUserData?: any) => {
    try {
      // First check standard Supabase auth
      const userResponse = await supabase.auth.getUser();
      let userId = userResponse.data.user?.id;
      
      // If no standard auth user but we have fallback user (either from state or passed in)
      const currentFallbackUser = fallbackUserData || fallbackUser;
      if (!userId && currentFallbackUser) {
        console.log('Using fallback user ID for profile:', currentFallbackUser.id);
        userId = currentFallbackUser.id;
        
        // For fallback auth, we'll just use the data we have
        if (!profile) {
          setProfile({
            id: currentFallbackUser.id,
            user_id: currentFallbackUser.id,
            full_name: currentFallbackUser.name || currentFallbackUser.email.split('@')[0],
            email: currentFallbackUser.email,
            company: '',
            role: currentFallbackUser.role || 'User',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setLoading(false);
          return; // Early return for fallback auth
        }
      }
      
      // If no user ID at all, we're not authenticated
      if (!userId) {
        throw new Error('Not authenticated');
      }

      // Otherwise, fetch from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      // First check standard auth
      const userResponse = await supabase.auth.getUser();
      let userId = userResponse.data.user?.id;
      
      // If no standard auth user but we have fallback user
      if (!userId && fallbackUser) {
        userId = fallbackUser.id;
        
        // For fallback auth, just update local state and localStorage
        const updatedUser = {
          ...fallbackUser,
          name: profile.full_name
        };
        localStorage.setItem('fallback_auth_user', JSON.stringify(updatedUser));
        setFallbackUser(updatedUser);
        
        toast.success('Profile updated successfully (offline mode)');
        setSaving(false);
        return; // Early return for fallback auth
      }
      
      // If no user ID at all, we're not authenticated
      if (!userId) {
        throw new Error('Not authenticated');
      }

      // Otherwise, update in database
      const { error } = await supabase
        .from('user_profiles')
        .update(profile)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="mt-1 text-gray-600">Manage your account preferences and settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-lg"
                />
                <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profile?.full_name || user?.email}</h2>
                <p className="text-sm text-gray-500">{profile?.role || 'Member'}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <User className="h-4 w-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile?.full_name || ''}
                        onChange={e => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Building className="h-4 w-4 inline mr-2" />
                        Company
                      </label>
                      <input
                        type="text"
                        value={profile?.company || ''}
                        onChange={e => setProfile(prev => prev ? { ...prev, company: e.target.value } : null)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Briefcase className="h-4 w-4 inline mr-2" />
                        Role
                      </label>
                      <input
                        type="text"
                        value={profile?.role || ''}
                        onChange={e => setProfile(prev => prev ? { ...prev, role: e.target.value } : null)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-6 w-6 text-indigo-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Enhance your account security</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                    <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <Lock className="h-6 w-6 text-indigo-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Change password</p>
                          <p className="text-sm text-gray-500">Update your password regularly to keep your account secure</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.email_notifications}
                          onChange={e => setSettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Receive email notifications</span>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notification Frequency
                        </label>
                        <select
                          value={settings.notification_frequency}
                          onChange={e => setSettings(prev => ({ ...prev, notification_frequency: e.target.value as any }))}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="instant">Instant</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Summary</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                    <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <CreditCard className="h-6 w-6 text-indigo-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Add payment method</p>
                          <p className="text-sm text-gray-500">Set up your payment information</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Billing History</h3>
                    <div className="text-center text-gray-500 py-8">
                      <p>No billing history available</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}