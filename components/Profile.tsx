import React, { useState } from 'react';
import { updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext.tsx';

export const Profile: React.FC = () => {
  const { user, firebaseUser, logout } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const emailChanged = email.trim() !== (user?.email ?? '');
  const nameChanged = name.trim() !== (user?.name ?? '');
  const hasChanges = nameChanged || emailChanged;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      if (nameChanged) {
        await updateProfile(firebaseUser, { displayName: name.trim() });
      }
      if (emailChanged) {
        if (!currentPassword) {
          setError('Enter your current password to change your email.');
          return;
        }
        const credential = EmailAuthProvider.credential(firebaseUser.email!, currentPassword);
        await reauthenticateWithCredential(firebaseUser, credential);
        await updateEmail(firebaseUser, email.trim());
      }
      setCurrentPassword('');
      setSuccess('Profile updated.');
    } catch (err: any) {
      setError(err.message ?? 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">Profile</h2>
        <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{success}</div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35] text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35] text-gray-800"
            />
          </div>

          {emailChanged && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to change email"
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35] text-gray-800"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="w-full bg-[#4f6b35] active:bg-[#3d5429] text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Account</h3>
        <button
          onClick={logout}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 active:bg-red-100 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};
