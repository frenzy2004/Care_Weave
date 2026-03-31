import { useMemo } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { generateHealthStory, HEALTH_STORY_DISCLAIMER } from '@/utils/healthStoryGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function HealthStory() {
  const { patient, symptoms, medications, visits, doctorMode } = useHealth();

  const paragraphs = useMemo(
    () => generateHealthStory(patient, symptoms, medications, visits, doctorMode),
    [patient, symptoms, medications, visits, doctorMode]
  );

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {doctorMode ? 'Clinical Narrative Summary' : 'Your Health Journey'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {doctorMode ? `Patient: ${patient.name}` : `${patient.name}'s Story`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground">{p}</p>
          ))}
          <p className="text-xs italic text-muted-foreground pt-4 border-t border-border">
            {HEALTH_STORY_DISCLAIMER}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
