import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../projects/useProjectStore';
import { Card } from '../../components/ui/Card';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { EmptyState } from '../../components/ui/EmptyState';

const BugsPage: React.FC = () => {
  const { id: projectIdFromUrl } = useParams<{ id: string }>();
  const { currentProjectId, setCurrentProjectId } = useProjectStore();

  // Update store when projectId comes from URL
  useEffect(() => {
    if (projectIdFromUrl && projectIdFromUrl !== currentProjectId) {
      setCurrentProjectId(projectIdFromUrl);
    }
  }, [projectIdFromUrl, currentProjectId, setCurrentProjectId]);
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bugs</h1>
        <p className="text-slate-600 font-medium">Track and manage project bugs</p>
      </div>

      <Card className="bg-gradient-to-br from-white to-slate-50/30">
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          title="Bug Tracking Coming Soon"
          description="We're working on a comprehensive bug tracking system. This feature will allow you to report, track, and resolve bugs efficiently."
        />
      </Card>
    </div>
  );
};

export default BugsPage;
