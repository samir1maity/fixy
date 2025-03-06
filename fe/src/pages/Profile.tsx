
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Building, 
  Globe, 
  Save,
  ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/dashboard-header';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="flex items-center mb-8">
          <Link to="/dashboard" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Your Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-card border rounded-xl p-6 flex flex-col items-center text-center"
            >
              <div className="mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold mb-1">{profileData.name}</h2>
              <p className="text-muted-foreground mb-4">{profileData.email}</p>
              
              <Button variant="outline" className="w-full mb-2">
                Change Photo
              </Button>
              
              <div className="w-full mt-6 pt-6 border-t">
                <h3 className="font-medium mb-4 text-left">Account Details</h3>
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
              className="bg-card border rounded-xl p-6 space-y-6"
            >
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  Full Name
                </label>
                <Input
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
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
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </motion.form>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Profile;
