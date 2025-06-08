
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Shield, Users, Eye } from 'lucide-react';

interface UserRoleManagerProps {
  currentUser: {
    name: string;
    role: string;
  };
}

const UserRoleManager = ({ currentUser }: UserRoleManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const mockUsers = [
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      email: 'sarah.mitchell@oxford.ac.uk',
      role: 'TabDirector',
      permissions: ['manage_tournament', 'view_all', 'edit_scores'],
      lastActive: '2 min ago',
      status: 'active'
    },
    {
      id: 2,
      name: 'Prof. Michael Brown',
      email: 'michael.brown@cambridge.ac.uk',
      role: 'Judge',
      permissions: ['view_assigned', 'enter_scores'],
      lastActive: '5 min ago',
      status: 'active'
    },
    {
      id: 3,
      name: 'Alice Johnson',
      email: 'alice.johnson@oxford.ac.uk',
      role: 'TeamCaptain',
      permissions: ['view_team', 'submit_registration'],
      lastActive: '1 hour ago',
      status: 'active'
    },
    {
      id: 4,
      name: 'System Admin',
      email: 'admin@debatedesk.com',
      role: 'SuperAdmin',
      permissions: ['full_access'],
      lastActive: '1 day ago',
      status: 'active'
    }
  ];

  const rolePermissions = {
    SuperAdmin: ['Full system access', 'User management', 'Tournament creation', 'Data export'],
    TabDirector: ['Tournament management', 'Score entry', 'Pairing generation', 'View all data'],
    Judge: ['View assigned debates', 'Enter scores', 'Submit feedback'],
    TeamCaptain: ['View team info', 'Register participants', 'View public standings'],
    PublicViewer: ['View public standings', 'View public schedule']
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      SuperAdmin: 'bg-red-100 text-red-800',
      TabDirector: 'bg-blue-100 text-blue-800',
      Judge: 'bg-green-100 text-green-800',
      TeamCaptain: 'bg-yellow-100 text-yellow-800',
      PublicViewer: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[role as keyof typeof colors]}>{role}</Badge>;
  };

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User & Role Management</h2>
          <p className="text-slate-600">Manage access permissions and user roles</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specified permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Email Address" type="email" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TabDirector">Tab Director</SelectItem>
                  <SelectItem value="Judge">Judge</SelectItem>
                  <SelectItem value="TeamCaptain">Team Captain</SelectItem>
                  <SelectItem value="PublicViewer">Public Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full">Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsers.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Judges</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsers.filter(u => u.role === 'Judge').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Captains</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsers.filter(u => u.role === 'TeamCaptain').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </div>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-sm text-slate-600">{user.lastActive}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Overview of permissions for each role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <Card key={role} className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getRoleBadge(role)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {permissions.map((permission, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        {permission}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManager;
