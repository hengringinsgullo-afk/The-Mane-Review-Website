import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  User, 
  Settings, 
  FileText, 
  Bell, 
  Lock,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (page: string, data?: any) => void;
  user?: any;
}

type Section = 'details' | 'preferences' | 'articles' | 'notifications' | 'security';

export function AccountPage({ onNavigate, user }: AccountPageProps) {
  const [activeSection, setActiveSection] = useState<Section>('details');

  const sections = [
    { id: 'details' as Section, label: 'My Account Details', icon: User },
    { id: 'preferences' as Section, label: 'My Preferences', icon: Settings },
    { id: 'articles' as Section, label: 'My Submitted Articles', icon: FileText },
    { id: 'notifications' as Section, label: 'Notifications', icon: Bell },
    { id: 'security' as Section, label: 'Security & Privacy', icon: Lock },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'details':
        return (
          <div className="space-y-8">
            <div className="pb-4 border-b">
              <h2 className="text-3xl font-bold mb-3">Account Details</h2>
              <p className="text-muted-foreground text-lg">Manage your personal information</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Full Name</Label>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <Input defaultValue={user?.name || 'John Doe'} className="border-0 bg-transparent p-0 focus-visible:ring-0" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Email Address</Label>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <Input type="email" defaultValue={user?.email || 'john@example.com'} className="border-0 bg-transparent p-0 focus-visible:ring-0" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Phone Number</Label>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <Input type="tel" defaultValue="(11) 98765-4321" className="border-0 bg-transparent p-0 focus-visible:ring-0" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Date of Birth</Label>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <Input type="date" className="border-0 bg-transparent p-0 focus-visible:ring-0" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-8 pt-6 border-t">
                  <Button size="lg" className="px-8">Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">St. Paul's School Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-base mb-1">Member Status</p>
                    <p className="text-muted-foreground">{user?.role || 'Student'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-8">
            <div className="pb-4 border-b">
              <h2 className="text-3xl font-bold mb-3">Preferences</h2>
              <p className="text-muted-foreground text-lg">Customize your experience</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Market Preferences</CardTitle>
                <CardDescription className="text-base mt-2">Choose your preferred markets and regions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Default Market Region</Label>
                  <select className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base">
                    <option>USA</option>
                    <option>Europe</option>
                    <option>South America</option>
                    <option>Asia</option>
                  </select>
                </div>
                <div className="flex justify-end mt-8 pt-6 border-t">
                  <Button size="lg" className="px-8">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'articles':
        return (
          <div className="space-y-8">
            <div className="pb-4 border-b">
              <h2 className="text-3xl font-bold mb-3">My Submitted Articles</h2>
              <p className="text-muted-foreground text-lg">View and manage your article submissions</p>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-12">
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-medium mb-3">No articles yet</h3>
                  <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    You haven't submitted any articles. Start contributing your insights!
                  </p>
                  <Button size="lg" onClick={() => onNavigate('opinion')} className="px-8">
                    Submit an Article
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="pb-4 border-b">
              <h2 className="text-3xl font-bold mb-3">Notifications</h2>
              <p className="text-muted-foreground text-lg">Manage your notification preferences</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">Market Updates</p>
                    <p className="text-muted-foreground">Daily market summaries and highlights</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 ml-4" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">New Articles</p>
                    <p className="text-muted-foreground">Get notified about new publications</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 ml-4" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">Watchlist Alerts</p>
                    <p className="text-muted-foreground">Price changes for your watchlist</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 ml-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <div className="pb-4 border-b">
              <h2 className="text-3xl font-bold mb-3">Security & Privacy</h2>
              <p className="text-muted-foreground text-lg">Keep your account secure</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Current Password</Label>
                  <Input type="password" className="h-12 text-base" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">New Password</Label>
                  <Input type="password" className="h-12 text-base" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Confirm New Password</Label>
                  <Input type="password" className="h-12 text-base" />
                </div>
                <div className="flex justify-end mt-8 pt-6 border-t">
                  <Button size="lg" className="px-8">Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16 items-start">
        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Account</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="flex flex-col gap-1 p-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-3 px-4 py-4 text-left transition-all rounded-lg ${
                        activeSection === section.id
                          ? 'bg-primary text-white font-medium shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="pl-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

