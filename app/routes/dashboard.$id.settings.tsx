import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { X, Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { Organization } from '@prisma/client';
import { LoaderFunctionArgs } from '@remix-run/node';
import { loader as dashboardLoader } from '~/routes/dashboard.$id';

// This would typically come from your API or state management

const roles = ['Admin', 'Member', 'Viewer'];

export const loader = ({ context, params, request }: LoaderFunctionArgs) => {
  return dashboardLoader({ context, params, request });
};

export default function OrganizationSettingsForm() {
  const params = useParams();
  const queryClient = useQueryClient();
  const currentOrg = (
    queryClient.getQueryCache().find({
      queryKey: ['orgs']
    })?.state?.data as Organization[] | undefined
  )?.find(org => org.id === params.id);

  const initialMembers = queryClient.getQueryData([
    `org_${params.id}_users`
  ]) as {
    role: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string | null;
      imageUrl: string | null;
    };
  }[];

  console.log(initialMembers);

  const [orgName, setOrgName] = useState(currentOrg?.name);
  const [orgDescription, setOrgDescription] = useState(currentOrg?.description);
  const [members, setMembers] = useState(initialMembers);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle photo upload logic here
    console.log('Photo uploaded:', event.target.files?.[0]);
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(
      members.map(member =>
        member.user.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(member => member.user.id !== memberId));
  };

  // const handleAddMember = () => {
  //   if (newMemberEmail) {
  //     setMembers([
  //       ...members,
  //       { id: Date.now(), name: '', email: newMemberEmail, role: 'Member' }
  //     ]);
  //     setNewMemberEmail('');
  //   }
  // };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', { orgName, orgDescription, members });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 w-full flex justify-center items-center relative"
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Organization Settings</h2>
          <p className="text-muted-foreground">
            Manage your organization's profile and members
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="Enter organization name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgPhoto">Organization Photo</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder.svg" alt="Organization" />
                <AvatarFallback>ORG</AvatarFallback>
              </Avatar>
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </div>
                <Input
                  id="photo-upload"
                  type="file"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                />
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Organization Description</Label>
            <Textarea
              id="description"
              value={orgDescription}
              className="resize-none h-48"
              onChange={e => setOrgDescription(e.target.value)}
              placeholder="Enter organization description"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Organization Description</Label>
            <Textarea
              id="description"
              value={orgDescription}
              className="resize-none h-48"
              onChange={e => setOrgDescription(e.target.value)}
              placeholder="Enter organization description"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Organization Description</Label>
            <Textarea
              id="description"
              value={orgDescription}
              className="resize-none h-48"
              onChange={e => setOrgDescription(e.target.value)}
              placeholder="Enter organization description"
              rows={4}
            />
          </div>
          <div className="space-y-4">
            <Label>Members</Label>
            {members.map(member => (
              <div key={member.user.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {member.user.firstName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-medium">
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <Select
                  onValueChange={value =>
                    handleRoleChange(member.user.id, value)
                  }
                  defaultValue={member.role}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.user.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="New member email"
              value={newMemberEmail}
              onChange={e => setNewMemberEmail(e.target.value)}
            />
            <Button type="button">Add Member</Button>
          </div>
        </div>
        <div>
          <Button type="submit">Save Changes</Button>
        </div>
      </div>
    </form>
  );
}
