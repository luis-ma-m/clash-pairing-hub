import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Download, Search, Edit, Trash2 } from 'lucide-react';
import { apiFetch } from "@/lib/api";
import { parseTeamsCsv, teamsToCsv, type TeamCsv } from "@/lib/csv";

type Team = {
  id: number;
  name: string;
  organization: string;
  speakers: string[];
  wins: number;
  losses: number;
  speakerPoints: number;
};

const TeamRoster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamName, setTeamName] = useState('');
  const [organization, setOrganization] = useState('');
  // dynamic speakers array
  const [speakers, setSpeakers] = useState<string[]>(['', '']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSpeakerField = () => {
    if (speakers.length >= 5) return;
    setSpeakers([...speakers, '']);
  };

  const removeSpeakerField = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const updateSpeaker = (index: number, value: string) => {
    const updated = [...speakers];
    updated[index] = value;
    setSpeakers(updated);
  };

  const queryClient = useQueryClient();

  const fetchTeams = async () => {
    const res = await apiFetch('/api/teams');
    if (!res.ok) throw new Error('Failed fetching teams');
    return res.json();
  };
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ['teams'], queryFn: fetchTeams });

  const addTeam = async () => {
    const validSpeakers = speakers.filter(Boolean);
    if (validSpeakers.length > 5) {
      throw new Error('Cannot add more than 5 speakers');
    }
    const res = await apiFetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: teamName,
        organization,
        speakers: validSpeakers
      })
    });
    if (!res.ok) throw new Error('Failed to add team');
    return res.json();
  };
  const { mutateAsync: createTeam } = useMutation({ mutationFn: addTeam, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }) });

  // ... updateTeam / deleteTeam mutations omitted for brevity ...

  const handleExport = () => {
    const data: TeamCsv[] = teams.map(t => ({
      name: t.name,
      organization: t.organization,
      speakers: t.speakers,
    }));
    const csv = teamsToCsv(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teams.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseTeamsCsv(text);
    for (const team of parsed) {
      await apiFetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
      });
    }
    queryClient.invalidateQueries({ queryKey: ['teams'] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ... filtering, stats, and rendering omitted for brevity ...

  return (
    <div className="space-y-6">
      {/* header with Import/Export buttons */}
      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {/* Add Team Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4" /> Add Team
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>Register a new team for the tournament</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} />
            <Input placeholder="Organization" value={organization} onChange={e => setOrganization(e.target.value)} />

            {speakers.map((spk, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder={`Speaker ${idx + 1}${idx < 2 ? '' : ' (optional)'}`}
                  value={spk}
                  onChange={e => updateSpeaker(idx, e.target.value)}
                />
                {speakers.length > 2 && (
                  <Button variant="ghost" className="text-red-600" onClick={() => removeSpeakerField(idx)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}

            {speakers.length < 5 && (
              <Button variant="outline" onClick={addSpeakerField}>
                Add Speaker
              </Button>
            )}

            <Button
              className="w-full"
              onClick={async () => {
                await createTeam();
                setTeamName('');
                setOrganization('');
                setSpeakers(['', '']);
              }}
            >
              Create Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* rest of roster table & analytics cards */}
    </div>
  );
};

export default TeamRoster;
