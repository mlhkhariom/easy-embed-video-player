
import { Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlayerAPI } from '@/types';
import PlayerAPISourceItem from './PlayerAPISourceItem';

interface PlayerAPISourceTableProps {
  playerAPIs: PlayerAPI[];
  handleEdit: (api: PlayerAPI) => void;
  handleDelete: (id: string) => void;
  handleToggleActive: (id: string) => void;
  handleMovePriority: (id: string, direction: 'up' | 'down') => void;
  handleAddNew: () => void;
}

const PlayerAPISourceTable = ({
  playerAPIs,
  handleEdit,
  handleDelete,
  handleToggleActive,
  handleMovePriority,
  handleAddNew
}: PlayerAPISourceTableProps) => {
  const sortedAPIs = [...playerAPIs].sort((a, b) => a.priority - b.priority);
  const maxPriority = Math.max(...playerAPIs.map(a => a.priority));

  if (playerAPIs.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No Player Sources</h3>
        <p className="mt-1 text-muted-foreground">
          Add your first player API source to enable video playback.
        </p>
        <Button onClick={handleAddNew} className="mt-4">
          <Plus className="mr-2 h-4 w-4" /> Add API Source
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">Priority</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">URL Template</TableHead>
          <TableHead className="w-16 text-center">Status</TableHead>
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAPIs.map((api) => (
          <PlayerAPISourceItem
            key={api.id}
            api={api}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleToggleActive={handleToggleActive}
            handleMovePriority={handleMovePriority}
            maxPriority={maxPriority}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default PlayerAPISourceTable;
