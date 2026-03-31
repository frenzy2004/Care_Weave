import { useState } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Plus, Trash2 } from 'lucide-react';

export default function ProviderDirectory() {
  const { providers, addProvider, removeProvider, doctorMode } = useHealth();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('');

  const handleAdd = () => {
    if (!name) { toast.error('Provider name is required'); return; }
    addProvider({ name, specialty, clinic });
    toast.success('Provider added');
    setShowForm(false);
    setName(''); setSpecialty(''); setClinic('');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? 'Care Team Registry' : 'Your Providers'}
        </h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Smith" />
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Gastroenterologist" />
              </div>
              <div className="space-y-2">
                <Label>Clinic</Label>
                <Input value={clinic} onChange={e => setClinic(e.target.value)} placeholder="City Medical" />
              </div>
            </div>
            <Button onClick={handleAdd}>Save Provider</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {providers.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.specialty} • {p.clinic}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { removeProvider(p.id); toast.success('Removed'); }}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
