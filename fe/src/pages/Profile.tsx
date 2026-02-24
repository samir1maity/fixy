
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Building, 
  Globe, 
  Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';

const Profile = () => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc.',
    website: 'https://acme.com'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <AppLayout scope="main">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card border rounded-xl p-5 flex flex-col items-center text-center"
          >
            <div className="mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                <AvatarFallback className="text-2xl">JD</AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-lg font-bold mb-1">{profileData.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{profileData.email}</p>
            
            <Button variant="outline" className="w-full mb-2 h-9 text-sm">
              Change Photo
            </Button>
            
            <div className="w-full mt-5 pt-5 border-t">
              <h3 className="text-sm font-medium mb-3 text-left">Account Details</h3>
              <div className="text-sm text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">Mar 2023</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
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
              <Input
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                Email Address
              </label>
              <Input
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleChange}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                Company Name
              </label>
              <Input
                name="company"
                value={profileData.company}
                onChange={handleChange}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                Website
              </label>
              <Input
                name="website"
                value={profileData.website}
                onChange={handleChange}
                className="h-9"
              />
            </div>
            
            <Button 
              type="submit" 
              size="sm"
              className="h-9 bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </motion.form>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
