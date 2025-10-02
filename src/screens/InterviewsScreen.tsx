import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import LinkC from "../components/LinkC";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Interview, InterviewStatus } from "../types/Interview";
import { getUserInterviews, addInterview, editInterview, deleteInterview } from "../api/interviews";
import { setInterviews as setInterviewsStore } from "../redux/interviewsSlice";

const InterviewsScreen = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Three-dot menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const dispatch = useDispatch();
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId = useSelector((state: RootState) => state.user.userId);
  const cachedInterviews = useSelector((state: RootState) => state.interviews.items);
  const cachedLastFetched = useSelector((state: RootState) => state.interviews.lastFetched);

  // Debounced autosave for notes (per row)
  const notesAutosaveTimers = useRef<Record<string, number | undefined>>({});
  const notesValues = useRef<Record<string, string>>({});
  const AUTOSAVE_MS = 600;
  const [savingNotesById, setSavingNotesById] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    position: "",
    company: "",
    status: InterviewStatus.APPLIED,
    interviewer: "",
    notes: "",
  });

// define fetchInterviews first
const fetchInterviews = useCallback(async () => {
  if (!jwtToken || !userId) return;
  try {
    setLoading(true);
    setError(null);
    const data = await getUserInterviews(userId, jwtToken);
    setInterviews(data);
  } catch (err) {
    setError("Failed to fetch interviews");
    console.error("Error fetching interviews:", err);
  } finally {
    setLoading(false);
  }
}, [jwtToken, userId]);

useEffect(() => {
  if (!jwtToken || !userId) {
    setLoading(false);
    return;
  }
  // If we already have local data, don't refetch
  if (interviews.length > 0) {
    setLoading(false);
    return;
  }
  // Hydrate from cache if it has items; otherwise fetch fresh
  if (cachedInterviews && cachedInterviews.length > 0) {
    setInterviews(cachedInterviews);
    setLoading(false);
    return;
  }
  // No local data and no cached items: fetch
  fetchInterviews();
}, [jwtToken, userId, cachedInterviews, fetchInterviews, interviews.length]);

// Keep Redux cache in sync after local state settles
useEffect(() => {
  dispatch(setInterviewsStore(interviews));
}, [interviews, dispatch]);

  // Close menu on any outside click
  useEffect(() => {
    const onDocClick = () => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openMenuId]);

  const handleAddInterview = () => {
    setEditingInterview(null);
    setFormData({
      position: "",
      company: "",
      status: InterviewStatus.APPLIED,
      interviewer: "",
      notes: "",
    });
    onOpen();
  };

  const handleEditInterview = (interview: Interview) => {
    setEditingInterview(interview);
    setFormData({
      position: interview.position,
      company: interview.company,
      status: interview.status,
      interviewer: interview.interviewer,
      notes: interview.notes,
    });
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (!jwtToken || !userId) return;
    
    try {
      await deleteInterview(userId, jwtToken, interviewId);
      setInterviews(prev => prev.filter(i => i.id !== interviewId));
      toast({
        title: "Interview deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to delete interview",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Save a single interview by id using current local state (with optional field overrides)
  const saveInterviewById = useCallback(async (id: string, overrides?: Partial<Interview>) => {
    if (!jwtToken || !userId) return;
    const current = interviews.find(i => i.id === id);
    if (!current) return;
    try {
      setSavingNotesById(prev => ({ ...prev, [id]: true }));
      const updated = await editInterview(
        userId,
        jwtToken,
        id,
        overrides?.position ?? current.position,
        overrides?.company ?? current.company,
        (overrides?.status as any) ?? current.status,
        overrides?.interviewer ?? current.interviewer,
        overrides?.notes ?? current.notes
      );
      setInterviews(prev => prev.map(i => (i.id === id ? updated : i)));
    } catch (err) {
      console.error("Autosave failed", err);
      toast({ title: "Failed to autosave interview", status: "error", duration: 1500, isClosable: true });
    } finally {
      setSavingNotesById(prev => ({ ...prev, [id]: false }));
    }
  }, [jwtToken, userId, interviews, toast]);

  const scheduleNotesAutosave = (id: string, value: string) => {
    if (notesAutosaveTimers.current[id]) {
      window.clearTimeout(notesAutosaveTimers.current[id]);
    }
    notesAutosaveTimers.current[id] = window.setTimeout(() => {
      // Update main state only when saving
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, notes: value } : i));
      void saveInterviewById(id, { notes: value });
    }, AUTOSAVE_MS);
  };

  const handleSubmit = async () => {
    if (!jwtToken || !userId) return;

    try {
      // Add new interview (modal submit)
      const newInterview = await addInterview(
        userId,
        jwtToken,
        formData.position,
        formData.company,
        formData.status,
        formData.interviewer,
        formData.notes
      );
      setInterviews(prev => [newInterview, ...prev]);
      toast({
        title: "Interview added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      toast({ title: "Failed to add interview", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleInlineSave = async (id: string) => {
    if (!jwtToken || !userId) return;
    try {
      const updatedInterview = await editInterview(
        userId,
        jwtToken,
        id,
        formData.position,
        formData.company,
        formData.status,
        formData.interviewer,
        formData.notes
      );
      setInterviews(prev => prev.map(i => (i.id === id ? updatedInterview : i)));
      dispatch(setInterviewsStore(interviews.map(i => (i.id === id ? updatedInterview : i))));
      setEditingInterview(null);
      toast({ title: "Interview updated", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: "Failed to update interview", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleInlineCancel = () => {
    setEditingInterview(null);
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.APPLIED:
        return "blue";
      case InterviewStatus.INTERVIEW_SCHEDULED:
        return "orange";
      case InterviewStatus.INTERVIEWED:
        return "yellow";
      case InterviewStatus.OFFERED:
        return "purple";
      case InterviewStatus.REJECTED:
        return "red";
      case InterviewStatus.ACCEPTED:
        return "green";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1200px" mx="auto" height="100vh" display="flex" flexDirection="column">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">Interviews</Text>
          <Button colorScheme="blue" onClick={handleAddInterview}>+ Add Interview</Button>
        </HStack>
      </VStack>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Box flex="1" overflowY="auto">
      <VStack spacing={3} align="stretch">
        {interviews.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={8}>
              <Text color="gray.500">No interviews found. Add your first interview!</Text>
            </CardBody>
          </Card>
        ) : (
          interviews.map((interview) => (
            <Card key={interview.id} _hover={{ shadow: "md" }}>
              <CardBody py={2} px={3}>
                {editingInterview && editingInterview.id === interview.id ? (
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={4}>
                      <Input
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="Position"
                      />
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as InterviewStatus })}
                        maxW="220px"
                      >
                        <option value={InterviewStatus.APPLIED}>Applied</option>
                        <option value={InterviewStatus.INTERVIEW_SCHEDULED}>Interview Scheduled</option>
                        <option value={InterviewStatus.INTERVIEWED}>Interviewed</option>
                        <option value={InterviewStatus.OFFERED}>Offered</option>
                        <option value={InterviewStatus.REJECTED}>Rejected</option>
                        <option value={InterviewStatus.ACCEPTED}>Accepted</option>
                      </Select>
                    </HStack>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company"
                    />
                    <Input
                      value={formData.interviewer}
                      onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                      placeholder="Interviewer"
                    />
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notes"
                      rows={3}
                    />
                    <HStack justify="flex-end" spacing={3}>
                      <Button variant="ghost" onClick={handleInlineCancel}>Cancel</Button>
                      <Button colorScheme="blue" onClick={() => handleInlineSave(interview.id)}>Save</Button>
                    </HStack>
                  </VStack>
                ) : (
                  <HStack align="left" spacing={2}>
                    <VStack align="start" spacing={0} flex="0 0 auto" maxW="40%" minW="180px">
                      <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                        {interview.position?.trim() || "Untitled Position"}
                      </Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={1}>
                        {interview.company?.trim() || "Company not specified"}
                      </Text>
                    </VStack>

                    <Box>
                      <Text fontSize="xs" color="gray.500" minW="80px" noOfLines={1}>
                          Interviewer:
                        </Text>
                      <Text fontSize="xs" color="gray.500" minW="80px" noOfLines={1}>
                        {interview.interviewer?.trim() || "N/A"}
                      </Text>
                    </Box>
                   

                    <HStack spacing={2} flexShrink={0}>
                      <Box
                        w="8px"
                        h="8px"
                        rounded="full"
                        bg={
                          interview.status === InterviewStatus.APPLIED
                            ? "blue.500"
                            : interview.status === InterviewStatus.INTERVIEW_SCHEDULED
                            ? "orange.500"
                            : interview.status === InterviewStatus.INTERVIEWED
                            ? "yellow.500"
                            : interview.status === InterviewStatus.OFFERED
                            ? "purple.500"
                            : interview.status === InterviewStatus.REJECTED
                            ? "red.500"
                            : interview.status === InterviewStatus.ACCEPTED
                            ? "green.500"
                            : "gray.400"
                        }
                        flexShrink={0}
                      />
                      <Select
                        value={interview.status}
                        onChange={(e) => {
                          const value = e.target.value as InterviewStatus;
                          setInterviews(prev => prev.map(i => i.id === interview.id ? { ...i, status: value } : i));
                          void saveInterviewById(interview.id, { status: value });
                        }}
                        size="sm"
                        maxW="170px"
                        flexShrink={0}
                      >
                        <option value={InterviewStatus.APPLIED}>Applied</option>
                        <option value={InterviewStatus.INTERVIEW_SCHEDULED}>Interview Scheduled</option>
                        <option value={InterviewStatus.INTERVIEWED}>Interviewed</option>
                        <option value={InterviewStatus.OFFERED}>Offered</option>
                        <option value={InterviewStatus.REJECTED}>Rejected</option>
                        <option value={InterviewStatus.ACCEPTED}>Accepted</option>
                      </Select>
                    </HStack>

                 

                    <Textarea
                      ref={(el) => {
                        if (el) {
                          notesValues.current[interview.id] = el.value;
                        }
                      }}
                      defaultValue={interview.notes || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        notesValues.current[interview.id] = value;
                        scheduleNotesAutosave(interview.id, value);
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        setInterviews(prev => prev.map(i => i.id === interview.id ? { ...i, notes: value } : i));
                      }}
                      placeholder="Notes"
                      rows={1}
                      size="sm"
                      flex={2}
                      minW={0}
                    />

                    <HStack spacing={2}>
                      <Box width="16px" minW="16px" display="flex" justifyContent="center" alignItems="center">
                        {savingNotesById[interview.id] ? (
                          <Spinner size="xs" color="blue.400" />
                        ) : null}
                      </Box>
                      <IconButton
                        aria-label="More options"
                        size="xs"
                        color="gray.500"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setMenuPosition({ top: rect.top + window.scrollY, left: rect.right + 8 + window.scrollX });
                          setOpenMenuId((prev) => (prev === interview.id ? null : interview.id));
                        }}
                        _hover={{ bg: "gray.100", color: "gray.700" }}
                        _active={{ bg: "gray.200" }}
                        icon={<Box as="span" fontSize="md" lineHeight="1">⋮</Box>}
                      />
                    </HStack>
                    {openMenuId === interview.id && menuPosition && (
                      <Box
                        position="fixed"
                        top={`${menuPosition.top}px`
                        }
                        left={`${menuPosition.left}px`}
                        zIndex={2000}
                        bg="transparent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Box
                          as="button"
                          display="block"
                          w="full"
                          textAlign="left"
                          px={3}
                          py={2}
                          color="black"
                          bg="white"
                          rounded="md"
                          _hover={{ bg: "gray.50" }}
                          my={1}
                          onClick={() => {
                            setEditingInterview(interview);
                            setOpenMenuId(null);
                            setMenuPosition(null);
                          }}
                        >
                          Edit
                        </Box>
                        <Box
                          as="button"
                          display="block"
                          w="full"
                          textAlign="left"
                          px={3}
                          py={2}
                          color="red.600"
                          bg="white"
                          rounded="md"
                          _hover={{ bg: "red.50", color: "red.700" }}
                          my={1}
                          onClick={() => {
                            handleDeleteInterview(interview.id);
                            setOpenMenuId(null);
                            setMenuPosition(null);
                          }}
                        >
                          Delete
                        </Box>
                      </Box>
                    )}
                  </HStack>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingInterview ? "Edit Interview" : "Add Interview"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Position</FormLabel>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Company</FormLabel>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as InterviewStatus })}
                >
                  <option value={InterviewStatus.APPLIED}>Applied</option>
                  <option value={InterviewStatus.INTERVIEW_SCHEDULED}>Interview Scheduled</option>
                  <option value={InterviewStatus.INTERVIEWED}>Interviewed</option>
                  <option value={InterviewStatus.OFFERED}>Offered</option>
                  <option value={InterviewStatus.REJECTED}>Rejected</option>
                  <option value={InterviewStatus.ACCEPTED}>Accepted</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Interviewer</FormLabel>
                <Input
                  value={formData.interviewer}
                  onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                  placeholder="e.g., John Smith"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </FormControl>
              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleSubmit}>
                  {editingInterview ? "Update" : "Add"} Interview
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InterviewsScreen;
