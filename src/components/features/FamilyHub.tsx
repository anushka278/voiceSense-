'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { familyRequestService, familyMessageService } from '@/lib/supabaseService';
import { supabase } from '@/lib/supabase';
import { 
  Users, Plus, ChevronRight, MessageCircle, X, Send, Check, XCircle
} from '@/components/icons';
import type { FamilyMember, FamilyRequest, FamilyMessage } from '@/types';

// Helper function to capitalize first letter of each word
function capitalizeWords(str: string): string {
  if (!str) return str;
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

interface FamilyMemberCardProps {
  member: FamilyMember;
  onClick: () => void;
}

function FamilyMemberCard({ member, onClick }: FamilyMemberCardProps) {
  const { currentUsername } = useStore();
  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
  // Only count messages that are unread AND not from the current user
  const unreadCount = member.messages.filter(m => 
    !m.read && 
    m.fromUsername?.toLowerCase() !== currentUsername?.toLowerCase()
  ).length;
  
  return (
    <Card hover onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-sage-light)] to-[var(--color-sage)] flex items-center justify-center text-white text-xl font-semibold">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
              {capitalizeWords(member.name)}
            </h3>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--color-terracotta)] text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-stone)]">{capitalizeWords(member.relationship)}</p>
          {member.status === 'pending' && (
            <p className="text-xs text-[var(--color-terracotta)] mt-1">Pending connection</p>
          )}
        </div>
        <ChevronRight className="text-[var(--color-stone)]" />
      </div>
    </Card>
  );
}

interface FamilyMemberDetailProps {
  member: FamilyMember;
  onBack: () => void;
  onRemove?: () => void;
}

function FamilyMemberDetail({ member, onBack, onRemove }: FamilyMemberDetailProps) {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user, sendFamilyMessage, markFamilyMessageRead, currentUsername, currentUserId, updateFamilyMemberMessages } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectionIdRef = useRef<string | null>(null);
  
  // Always get the latest member data from the store
  const currentMember = user?.familyMembers?.find(m => m.id === member.id) || member;
  
  // Get messages from the current member (will update when store updates)
  const messages = currentMember.messages || [];
  const initials = currentMember.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  // Use stored current username
  const currentUserUsername = currentUsername?.toLowerCase() || '';
  
  // Load messages and set up real-time subscription
  useEffect(() => {
    if (!currentMember.username || !currentUserId) return;
    
    let subscription: any = null;
    
    const setupRealtime = async () => {
      try {
        // Find the connection ID
        const connections = await familyRequestService.getAcceptedConnections(currentUserId);
        const connection = connections.find(c => c.username === currentMember.username?.toLowerCase());
        
        if (!connection) return;
        
        connectionIdRef.current = connection.connectionId;
        
        // Load initial messages
        const initialMessages = await familyMessageService.getMessages(connection.connectionId);
        updateFamilyMemberMessages(currentMember.username, initialMessages);
        
        // Set up real-time subscription for new messages
        subscription = supabase
          .channel(`family_messages:${connection.connectionId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'family_messages',
              filter: `connection_id=eq.${connection.connectionId}`
            },
            async (payload) => {
              // Reload all messages when a new one is inserted
              const updatedMessages = await familyMessageService.getMessages(connection.connectionId);
              updateFamilyMemberMessages(currentMember.username, updatedMessages);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'family_messages',
              filter: `connection_id=eq.${connection.connectionId}`
            },
            async (payload) => {
              // Reload all messages when one is updated (e.g., marked as read)
              const updatedMessages = await familyMessageService.getMessages(connection.connectionId);
              updateFamilyMemberMessages(currentMember.username, updatedMessages);
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };
    
    setupRealtime();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [currentMember.username, currentUserId, updateFamilyMemberMessages]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);
  
  // Mark messages as read when viewing (in useEffect to avoid setState during render)
  useEffect(() => {
    if (!currentUserUsername) return;
    const unreadMessages = messages.filter(m => !m.read && m.fromUsername?.toLowerCase() !== currentUserUsername);
    unreadMessages.forEach(msg => {
      markFamilyMessageRead(msg.id);
    });
  }, [messages, currentUserUsername, markFamilyMessageRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentMember.username || isSending) return;
    
    setIsSending(true);
    try {
      await sendFamilyMessage(currentMember.username, messageText.trim());
      setMessageText('');
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error('Error sending message:', {
        message: errorMessage,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        username: currentMember.username
      });
      // Optionally show error to user
      alert(`Failed to send message: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-[var(--color-sage)] font-medium flex items-center gap-1"
        >
          ← Back to family
        </button>
        {onRemove && (
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to remove ${capitalizeWords(currentMember.name)} from your family members?`)) {
                onRemove();
              }
            }}
            className="text-[var(--color-terracotta)] font-medium flex items-center gap-1"
          >
            <X size={18} />
            Remove
          </button>
        )}
      </div>
      
      {/* Profile header */}
      <Card>
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-sage-light)] to-[var(--color-sage)] flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-4">
            {initials}
          </div>
          <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
            {capitalizeWords(currentMember.name)}
          </h2>
          <p className="text-[var(--color-stone)]">{capitalizeWords(currentMember.relationship)}</p>
          {currentMember.username && (
            <p className="text-xs text-[var(--color-sage)] mt-1">@{currentMember.username}</p>
          )}
        </div>
      </Card>
      
      {/* Messages */}
      <Card>
        <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-4 flex items-center gap-2">
          <MessageCircle size={18} className="text-[var(--color-sage)]" />
          Messages
        </h3>
        
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {messages.length > 0 ? (
            <>
              {messages.map(message => {
                const isFromMe = message.fromUsername?.toLowerCase() === currentUserUsername;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        isFromMe
                          ? 'bg-[var(--color-sage)] text-white'
                          : 'bg-[var(--color-sand)] text-[var(--color-charcoal)]'
                      }`}
                    >
                      {!isFromMe && (
                        <p className="text-xs opacity-75 mb-1">{message.fromName}</p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isFromMe ? 'opacity-75' : 'text-[var(--color-stone)]'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <p className="text-center text-[var(--color-stone)] py-6">
              No messages yet. Start a conversation!
            </p>
          )}
        </div>
        
        {/* Message input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending || currentMember.status !== 'connected'}
            icon={<Send size={18} />}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface AddFamilyMemberFormProps {
  onRequest: (username: string, name: string, relationship: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function AddFamilyMemberForm({ onRequest, onCancel, isLoading }: AddFamilyMemberFormProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async () => {
    if (!name || !relationship || !username.trim() || isLoading) return;
    await onRequest(username.trim(), name, relationship);
    setName('');
    setRelationship('');
    setUsername('');
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
          Request Family Connection
        </h3>
        <button onClick={onCancel}>
          <X size={20} className="text-[var(--color-stone)]" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-[var(--color-stone)] block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name..."
            className="w-full p-3 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none"
          />
        </div>
        
        <div>
          <label className="text-sm text-[var(--color-stone)] block mb-1">Relationship</label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none bg-white"
          >
            <option value="">Select relationship...</option>
            <option value="Son">Son</option>
            <option value="Daughter">Daughter</option>
            <option value="Grandson">Grandson</option>
            <option value="Granddaughter">Granddaughter</option>
            <option value="Spouse">Spouse</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Caregiver">Caregiver</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-[var(--color-stone)] block mb-1">
            Username <span className="text-[var(--color-terracotta)]">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Their Sage username..."
            className="w-full p-3 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none"
          />
          <p className="text-xs text-[var(--color-stone)] mt-1">
            Enter their username to send a connection request. They must accept to connect.
          </p>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!name || !relationship || !username.trim() || isLoading}
          fullWidth
        >
          {isLoading ? 'Sending...' : 'Send Request'}
        </Button>
      </div>
    </Card>
  );
}

interface FamilyRequestCardProps {
  request: FamilyRequest;
  onAccept: () => void;
  onReject: () => void;
}

function FamilyRequestCard({ request, onAccept, onReject, isLoading }: FamilyRequestCardProps) {
  const initials = request.fromName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <Card className="border-2 border-[var(--color-sage)]/30">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-sage-light)] to-[var(--color-sage)] flex items-center justify-center text-white text-xl font-semibold">
          {initials}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-[var(--color-charcoal)] text-lg">
            {capitalizeWords(request.fromName)}
          </h3>
          <p className="text-base text-[var(--color-stone)] mt-1">{capitalizeWords(request.relationship)}</p>
          <p className="text-sm text-[var(--color-sage)] mt-1">@{request.fromUsername}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            icon={<Check size={18} />}
            onClick={onAccept}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Accepting...' : 'Accept'}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            icon={<XCircle size={18} />}
            onClick={onReject}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Rejecting...' : 'Deny'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function FamilyHub() {
  const { 
    user, 
    removeFamilyMember, 
    requestFamilyConnection,
    acceptFamilyRequest,
    rejectFamilyRequest,
    familyRequests,
    currentUserId,
    loadFamilyData
  } = useStore();
  
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<FamilyRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FamilyRequest[]>([]);
  
  // Load pending requests on mount and when requests change
  useEffect(() => {
    const loadRequests = async () => {
      if (!user?.id) return;
      
      try {
        // Get user ID from user object (it's stored as id)
        const userId = user.id;
        const pending = await familyRequestService.getPendingRequests(userId);
        setPendingRequests(pending);
        
        // Get sent requests (pending requests sent by current user)
        // Check by fromUserId matching user.id
        const sent = familyRequests.filter(r => 
          r.status === 'pending' && 
          r.fromUserId === userId
        );
        setSentRequests(sent);
      } catch (error) {
        console.error('Error loading pending requests:', error);
      }
    };
    
    loadRequests();
  }, [user?.id, familyRequests]);
  
  const familyMembers = user?.familyMembers || [];

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestConnection = async (username: string, name: string, relationship: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await requestFamilyConnection(username, name, relationship);
      setShowAddForm(false);
      // Success - request sent state will be shown automatically
    } catch (err: any) {
      setError(err.message || 'Failed to send connection request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeFamilyMember(memberId);
      setSelectedMember(null);
    } catch (err: any) {
      alert(err.message || 'Failed to remove family member');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Accepting request:', requestId);
      await acceptFamilyRequest(requestId);
      console.log('Request accepted successfully');
      setShowRequests(false);
      // Refresh the requests list
      const userId = user?.id;
      if (userId) {
        const pending = await familyRequestService.getPendingRequests(userId);
        setPendingRequests(pending);
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error('Error accepting request in UI:', {
        message: errorMessage,
        code: err?.code,
        details: err?.details
      });
      setError(errorMessage || 'Failed to accept connection request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await rejectFamilyRequest(requestId);
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setIsLoading(false);
    }
  };

  // View for family requests
  if (showRequests) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
              Connection Requests
            </h2>
            <p className="text-[var(--color-stone)]">
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowRequests(false)}
            className="p-2 rounded-xl hover:bg-[var(--color-sand)] transition-colors"
          >
            <ChevronRight size={24} className="text-[var(--color-stone)] rotate-180" />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <Users size={48} className="text-[var(--color-sage)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--color-stone)]">No pending requests</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <FamilyRequestCard
                key={request.id}
                request={request}
                onAccept={() => handleAcceptRequest(request.id)}
                onReject={() => handleRejectRequest(request.id)}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedMember) {
    const latestMember = user?.familyMembers?.find(m => m.id === selectedMember.id) || selectedMember;
    return (
      <FamilyMemberDetail 
        member={latestMember} 
        onBack={() => setSelectedMember(null)}
        onRemove={() => handleRemoveMember(latestMember.id)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
            Family Hub
          </h2>
          <p className="text-[var(--color-stone)]">
            Connect and message with family members
          </p>
        </div>
        <div className="flex gap-2">
          {pendingRequests.length > 0 && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowRequests(true)}
            >
              Requests ({pendingRequests.length})
            </Button>
          )}
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setShowAddForm(true);
              setError(null);
            }}
            disabled={isLoading}
          >
            Add
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-[var(--color-agitated)]/10 border-[var(--color-agitated)]">
          <p className="text-[var(--color-agitated)] text-sm">{error}</p>
        </Card>
      )}

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AddFamilyMemberForm 
              onRequest={handleRequestConnection}
              onCancel={() => {
                setShowAddForm(false);
                setError(null);
              }}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show pending requests prominently at the top */}
      {pendingRequests.length > 0 && !showRequests && (
        <Card className="bg-[var(--color-terracotta)]/10 border-2 border-[var(--color-terracotta)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-[var(--color-terracotta)]/20 flex items-center justify-center">
                <Users size={24} className="text-[var(--color-terracotta)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-[var(--color-charcoal)] text-lg">
                  New Connection Request{pendingRequests.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-[var(--color-stone)]">
                  {pendingRequests.length} person{pendingRequests.length !== 1 ? 's' : ''} want{pendingRequests.length === 1 ? 's' : ''} to connect with you
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowRequests(true)}
              size="lg"
            >
              View Requests ({pendingRequests.length})
            </Button>
          </div>
        </Card>
      )}

      {/* Show sent requests status - prominent card */}
      {sentRequests.length > 0 && (
        <Card className="bg-[var(--color-sage)]/10 border-2 border-[var(--color-sage)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-sage)]/20 flex items-center justify-center">
              <Users size={24} className="text-[var(--color-sage)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-[var(--color-charcoal)] text-lg">
                Connection Request{sentRequests.length !== 1 ? 's' : ''} Sent
              </h3>
              <p className="text-[var(--color-stone)]">
                {sentRequests.length} request{sentRequests.length !== 1 ? 's' : ''} waiting for response. You'll be notified when they accept.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3 stagger-children">
        {familyMembers.map(member => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            onClick={() => handleSelectMember(member)}
          />
        ))}
      </div>

      {familyMembers.length === 0 && !showAddForm && (
        <Card className="text-center py-8">
          <Users size={48} className="mx-auto text-[var(--color-stone)] mb-4" />
          <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-2">
            No family members yet
          </h3>
          <p className="text-[var(--color-stone)] mb-4">
            Send connection requests to family members to start messaging.
          </p>
          <Button onClick={() => setShowAddForm(true)} icon={<Plus size={18} />}>
            Request Connection
          </Button>
        </Card>
      )}
    </div>
  );
}
