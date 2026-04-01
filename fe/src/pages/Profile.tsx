import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import AppShell from '@/components/layout/AppShell';
import userApiService from '@/services/user-api';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const Profile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    orgName: '',
  });
  const [memberSince, setMemberSince] = useState('');

  useEffect(() => {
    userApiService.getProfile()
      .then(user => {
        setForm({
          name: user.name ?? '',
          email: user.email ?? '',
          orgName: user.orgName ?? '',
        });
        setMemberSince(
          new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        );
      })
      .catch(() => {
        toast({ title: 'Failed to load profile', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApiService.updateProfile({
        name: form.name,
        email: form.email,
        orgName: form.orgName,
      });
      toast({ title: 'Profile updated', description: 'Your profile has been successfully updated.' });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <AppShell>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left card */}
          <div className="col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-card border rounded-xl p-5 flex flex-col items-center text-center"
            >
              <div className="mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-lg font-bold mb-1">{form.name}</h2>
              <p className="text-sm text-muted-foreground mb-1">{form.email}</p>
              {form.orgName && (
                <p className="text-xs text-muted-foreground mb-4">{form.orgName}</p>
              )}

              <div className="w-full mt-5 pt-5 border-t">
                <h3 className="text-sm font-medium mb-3 text-left">Account Details</h3>
                <div className="text-sm text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">{memberSince}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Edit form */}
          <div className="col-span-1 md:col-span-2">
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-card border rounded-xl p-5 space-y-5"
            >
              <h2 className="text-lg font-bold mb-2">Edit Profile</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  Full Name
                </label>
                <Input name="name" value={form.name} onChange={handleChange} className="h-9" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  Email Address
                </label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} className="h-9" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  Organisation Name
                </label>
                <Input
                  name="orgName"
                  placeholder="e.g. Acme Inc."
                  value={form.orgName}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-9 bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save Changes</>
                )}
              </Button>
            </motion.form>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Profile;
