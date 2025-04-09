
import { Shield, Play, Pause, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { PlayerAPI } from '@/types';

interface PlayerAPISourceItemProps {
  api: PlayerAPI;
  handleEdit: (api: PlayerAPI) => void;
  handleDelete: (id: string) => void;
  handleToggleActive: (id: string) => void;
  handleMovePriority: (id: string, direction: 'up' | 'down') => void;
  maxPriority: number;
}

const PlayerAPISourceItem = ({
  api,
  handleEdit,
  handleDelete,
  handleToggleActive,
  handleMovePriority,
  maxPriority
}: PlayerAPISourceItemProps) => {
  return (
    <TableRow key={api.id}>
      <TableCell className="text-center">
        <div className="flex flex-col items-center">
          <span className="font-medium">{api.priority}</span>
          <div className="flex mt-1">
            <button 
              onClick={() => handleMovePriority(api.id, 'up')}
              disabled={api.priority === 1}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowUp size={14} />
            </button>
            <button 
              onClick={() => handleMovePriority(api.id, 'down')}
              disabled={api.priority === maxPriority}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowDown size={14} />
            </button>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium flex items-center">
          <Shield size={16} className="mr-2 text-muted-foreground" />
          {api.name}
          {api.apiKey && (
            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              API Key
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell truncate max-w-xs">
        <code className="text-xs bg-muted p-1 rounded">{api.url}</code>
      </TableCell>
      <TableCell className="text-center">
        <button
          onClick={() => handleToggleActive(api.id)}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            api.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {api.isActive ? (
            <>
              <Play size={12} className="mr-1" /> Active
            </>
          ) : (
            <>
              <Pause size={12} className="mr-1" /> Inactive
            </>
          )}
        </button>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(api)}
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(api.id)}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PlayerAPISourceItem;
