import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Menu,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { actionItemService, gapAssessmentService } from '../services/api';
import { ActionItem, GapAssessment } from '../types';

const ActionItemsPage: React.FC = () => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [gapAssessments, setGapAssessments] = useState<GapAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActionItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    assigned_to: '',
    due_date: '',
    gap_assessment_id: '',
    category: '',
    file_name: '',
    file_path: '',
    file_size: '',
    file_type: '',
    clause_reference: '',
    annex_reference: '',
  });

  const statusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsResponse, gapResponse] = await Promise.all([
        actionItemService.getAll(),
        gapAssessmentService.getAll(),
      ]);
      // Ensure we always set arrays, even if the API returns null
      setActionItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
      setGapAssessments(Array.isArray(gapResponse.data) ? gapResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error to prevent crashes
      setActionItems([]);
      setGapAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item?: ActionItem) => {
    if (item) {
      setEditing(item);
      setFormData({
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        assigned_to: item.assigned_to,
        due_date: item.due_date || '',
        gap_assessment_id: item.gap_assessment_id?.toString() || '',
        category: item.category,
        file_name: item.file_name || '',
        file_path: item.file_path || '',
        file_size: item.file_size?.toString() || '',
        file_type: item.file_type || '',
        clause_reference: item.clause_reference || '',
        annex_reference: item.annex_reference || '',
      });
    } else {
      setEditing(null);
      setFormData({
        title: '',
        description: '',
        status: 'Not Started',
        priority: 'Medium',
        assigned_to: '',
        due_date: '',
        gap_assessment_id: '',
        category: '',
        file_name: '',
        file_path: '',
        file_size: '',
        file_type: '',
        clause_reference: '',
        annex_reference: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        gap_assessment_id: formData.gap_assessment_id ? parseInt(formData.gap_assessment_id) : null,
        due_date: formData.due_date || null,
        completed_date: formData.status === 'Completed' ? new Date().toISOString().split('T')[0] : null,
        file_size: formData.file_size ? parseInt(formData.file_size) : null,
        file_name: formData.file_name || null,
        file_path: formData.file_path || null,
        file_type: formData.file_type || null,
        clause_reference: formData.clause_reference || null,
        annex_reference: formData.annex_reference || null,
      };
      if (editing) {
        await actionItemService.update(editing.id, payload);
      } else {
        await actionItemService.create(payload);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving action item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this action item?')) {
      try {
        await actionItemService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting action item:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'On Hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const isOverdue = (dueDate: string | null | undefined, status: string) => {
    if (!dueDate || status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredItems = (Array.isArray(actionItems) ? actionItems : []).filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Action Items</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Action Item
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              label="Priority"
            >
              <MenuItem value="all">All</MenuItem>
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Menu>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Linked Assessment</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {actionItems && actionItems.length === 0
                      ? 'No action items found. Click "Add Action Item" to create one.'
                      : 'No action items match the current filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
              const overdue = isOverdue(item.due_date, item.status);
              const linkedAssessment = item.gap_assessment_id && Array.isArray(gapAssessments)
                ? gapAssessments.find((a) => a.id === item.gap_assessment_id)
                : null;

              return (
                <TableRow
                  key={item.id}
                  sx={{
                    backgroundColor: overdue ? 'error.light' : 'inherit',
                    '&:hover': {
                      backgroundColor: overdue ? 'error.light' : 'action.hover',
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {item.title}
                    </Typography>
                    {item.description && (
                      <Typography variant="caption" color="text.secondary">
                        {item.description.length > 50
                          ? `${item.description.substring(0, 50)}...`
                          : item.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.priority}
                      color={getPriorityColor(item.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.assigned_to || '-'}</TableCell>
                  <TableCell>
                    {item.due_date ? (
                      <Typography
                        variant="body2"
                        color={overdue ? 'error' : 'inherit'}
                        fontWeight={overdue ? 600 : 400}
                      >
                        {new Date(item.due_date).toLocaleDateString()}
                        {overdue && ' ⚠️'}
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.file_name ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFileIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">{item.file_name}</Typography>
                          {item.file_size && (
                            <Typography variant="caption" color="text.secondary">
                              {item.file_size < 1024
                                ? `${item.file_size} B`
                                : item.file_size < 1024 * 1024
                                ? `${(item.file_size / 1024).toFixed(1)} KB`
                                : `${(item.file_size / (1024 * 1024)).toFixed(1)} MB`}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.clause_reference || item.annex_reference ? (
                      <Box>
                        {item.clause_reference && (
                          <Chip label={item.clause_reference} size="small" variant="outlined" sx={{ mb: 0.5, mr: 0.5 }} />
                        )}
                        {item.annex_reference && (
                          <Chip label={item.annex_reference} size="small" variant="outlined" color="primary" />
                        )}
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {linkedAssessment ? (
                      <Typography variant="body2" color="primary">
                        {linkedAssessment.standard_ref}
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{item.category || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(item)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editing ? 'Edit Action Item' : 'Add Action Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  label="Priority"
                >
                  {priorityOptions.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Assigned To"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                fullWidth
              />
              <TextField
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Link to Gap Assessment</InputLabel>
              <Select
                value={formData.gap_assessment_id}
                onChange={(e) => setFormData({ ...formData, gap_assessment_id: e.target.value })}
                label="Link to Gap Assessment"
              >
                <MenuItem value="">None</MenuItem>
                {Array.isArray(gapAssessments) && gapAssessments.map((assessment) => (
                  <MenuItem key={assessment.id} value={assessment.id.toString()}>
                    {assessment.standard_ref} - {assessment.assessment_question.substring(0, 50)}...
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
            />
            <Typography variant="subtitle2" sx={{ mt: 1, mb: -1 }}>
              ISO 27001 References
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Clause Reference"
                value={formData.clause_reference}
                onChange={(e) => setFormData({ ...formData, clause_reference: e.target.value })}
                fullWidth
                placeholder="e.g., Clause 4.1"
              />
              <TextField
                label="Annex Reference"
                value={formData.annex_reference}
                onChange={(e) => setFormData({ ...formData, annex_reference: e.target.value })}
                fullWidth
                placeholder="e.g., A.5.1"
              />
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: -1 }}>
              Evidence/Document Information
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="File Name"
                value={formData.file_name}
                onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                fullWidth
              />
              <TextField
                label="File Type"
                value={formData.file_type}
                onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                fullWidth
                placeholder="e.g., PDF, DOCX"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="File Path"
                value={formData.file_path}
                onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                fullWidth
                placeholder="/uploads/evidence/..."
              />
              <TextField
                label="File Size (bytes)"
                type="number"
                value={formData.file_size}
                onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.title}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActionItemsPage;
