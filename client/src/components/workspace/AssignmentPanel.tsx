import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronUp, BookOpen, Cpu, Target, Clock } from 'lucide-react';
import { Card, DifficultyBadge } from '../ui/Card';
import type { Assignment } from '../../services/api';

interface AssignmentPanelProps {
  assignment: Assignment;
  onGetHint: () => void;
  hintText?: string;
  isLoadingHint?: boolean;
}

export function AssignmentPanel({ assignment, onGetHint, hintText, isLoadingHint }: AssignmentPanelProps) {
  const [showSyntax, setShowSyntax] = useState(false);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">{assignment.title}</h2>
            {assignment.topic && (
              <span className="text-sm text-arduino-400">{assignment.topic}</span>
            )}
          </div>
          <DifficultyBadge difficulty={assignment.difficulty} />
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            ~{assignment.estimatedMinutes || 15} min
          </span>
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-arduino-400 mb-2">
              <Target className="w-4 h-4" /> Objective
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{assignment.objective}</p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-arduino-400 mb-2">
              <Cpu className="w-4 h-4" /> Components
            </h3>
            <div className="flex flex-wrap gap-2">
              {assignment.components.map((c, i) => (
                <span key={i} className="badge bg-white/10 text-gray-300">{c}</span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-arduino-400 mb-2">
              <Target className="w-4 h-4" /> Required in Your Code
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              Define and use these variables in your sketch. Check Code verifies each one.
            </p>
            <div className="flex flex-wrap gap-2">
              {assignment.testVariables.map((v, i) => (
                <code key={i} className="badge bg-arduino-500/20 text-arduino-300 font-mono text-xs px-2 py-1">
                  {v}
                </code>
              ))}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-arduino-400 mb-2">
              <BookOpen className="w-4 h-4" /> Instructions
            </h3>
            <ol className="space-y-2">
              {assignment.instructions.map((step, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-3">
                  <span className="text-arduino-500 font-bold shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </Card>

      <Card>
        <button
          onClick={() => { onGetHint(); setShowHint(true); }}
          disabled={isLoadingHint}
          className="btn-secondary w-full"
        >
          <Lightbulb className="w-4 h-4" />
          {isLoadingHint ? 'Getting hint...' : 'Need Help?'}
        </button>

        {showHint && hintText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20"
          >
            <p className="text-sm text-yellow-200">{hintText}</p>
          </motion.div>
        )}
      </Card>

      <Card>
        <button
          onClick={() => setShowSyntax(!showSyntax)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-semibold text-arduino-400">Syntax Cheat Sheet</span>
          {showSyntax ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSyntax && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 space-y-2"
          >
            {assignment.syntaxConcepts.map((concept, i) => (
              <div key={i} className="text-sm text-gray-300 p-2 bg-white/5 rounded-lg">
                {concept}
              </div>
            ))}
          </motion.div>
        )}
      </Card>
    </div>
  );
}
