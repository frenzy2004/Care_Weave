import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useHealth } from '@/contexts/HealthDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { SymptomType, Severity, SYMPTOM_LABELS } from '@/types/health';
import { Flame } from 'lucide-react';

const EMOJI_FACES = ['😊', '🙂', '😐', '😕', '😣', '😖', '😫', '😩', '🥵', '😵'];
const CLINICAL_SCALE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const symptomOptions: SymptomType[] = ['fatigue', 'gi_issues', 'joint_pain', 'heart_symptoms', 'brain_fog', 'headache', 'skin_issues'];

export default function SymptomLogger() {
  const { addSymptom, providers, doctorMode } = useHealth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [painLevel, setPainLevel] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Map<SymptomType, Severity>>(new Map());
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [providerId, setProviderId] = useState('');
  const [isFlare, setIsFlare] = useState(searchParams.get('flare') === 'true');

  const toggleSymptom = (type: SymptomType) => {
    const next = new Map(selectedSymptoms);
    if (next.has(type)) next.delete(type);
    else next.set(type, 'moderate');
    setSelectedSymptoms(next);
  };

  const setSeverity = (type: SymptomType, sev: Severity) => {
    const next = new Map(selectedSymptoms);
    next.set(type, sev);
    setSelectedSymptoms(next);
  };

  const handleSubmit = () => {
    if (selectedSymptoms.size === 0) {
      toast.error('Select at least one symptom');
      return;
    }
    addSymptom({
      date,
      painLevel,
      symptoms: Array.from(selectedSymptoms.entries()).map(([type, severity]) => ({ type, severity })),
      notes,
      providerId: providerId || undefined,
      isFlareDay: isFlare,
    });
    toast.success(doctorMode ? 'Symptom entry recorded' : 'Symptoms logged! 💪');
    navigate('/');
  };

  const scale = doctorMode ? CLINICAL_SCALE : EMOJI_FACES;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {doctorMode ? 'Record Symptom Entry' : 'Log Symptoms'}
      </h1>

      {/* Flare Toggle */}
      <Card className={`transition-all duration-300 ${isFlare ? 'border-chart-red/50 bg-gradient-to-r from-chart-red/10 to-transparent animate-pulse-glow' : 'hover-lift'}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isFlare ? 'bg-chart-red/15' : 'bg-muted'}`}>
              <Flame className={`h-4 w-4 transition-colors ${isFlare ? 'text-chart-red' : 'text-muted-foreground'}`} />
            </div>
            <span className="font-medium">{doctorMode ? 'Flare Event' : '🔥 Flare Day'}</span>
          </div>
          <Switch checked={isFlare} onCheckedChange={setIsFlare} />
        </CardContent>
      </Card>

      {/* Pain Level — Circular buttons */}
      <Card className="hover-lift">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {doctorMode ? 'Pain Severity (1-10)' : 'How are you feeling?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 justify-center flex-wrap">
            {scale.map((label, i) => (
              <button
                key={i}
                onClick={() => setPainLevel(i + 1)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  painLevel === i + 1
                    ? 'gradient-primary text-white shadow-lg scale-110 glow-primary'
                    : 'bg-muted hover:bg-accent hover:scale-105 text-muted-foreground'
                }`}
              >
                {doctorMode ? label : <span className="text-base">{label}</span>}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            {doctorMode ? `Severity: ${painLevel}/10` : `Pain level: ${painLevel}/10`}
          </p>
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card className="hover-lift">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Symptoms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {symptomOptions.map(type => (
            <div key={type} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${selectedSymptoms.has(type) ? 'bg-accent/50' : 'hover:bg-muted/50'}`}>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSymptoms.has(type)}
                  onCheckedChange={() => toggleSymptom(type)}
                />
                <Label className="cursor-pointer">{SYMPTOM_LABELS[type]}</Label>
              </div>
              {selectedSymptoms.has(type) && (
                <Select
                  value={selectedSymptoms.get(type)}
                  onValueChange={(v) => setSeverity(type, v as Severity)}
                >
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Date & Provider */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Provider (optional)</Label>
          <Select value={providerId} onValueChange={setProviderId}>
            <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
            <SelectContent>
              {providers.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={doctorMode ? 'Clinical observations...' : 'How are things going today?'}
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full gradient-primary border-0 text-white shadow-lg hover:shadow-xl transition-shadow" size="lg">
        {doctorMode ? 'Record Entry' : 'Save Symptoms'}
      </Button>
    </div>
  );
}
