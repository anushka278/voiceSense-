'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, User, Plus, ChevronRight, Heart, Calendar, 
  MessageCircle, Image, X 
} from '@/components/icons';
import type { FamilyMember, FamilyMemory, SharedHealthEntry } from '@/types';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onClick: () => void;
}

function FamilyMemberCard({ member, onClick }: FamilyMemberCardProps) {
  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <Card hover onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-sage-light)] to-[var(--color-sage)] flex items-center justify-center text-white text-xl font-semibold">
          {initials}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
            {member.name}
          </h3>
          <p className="text-sm text-[var(--color-stone)]">{member.relationship}</p>
          {member.memories.length > 0 && (
            <p className="text-xs text-[var(--color-sage)] mt-1">
              {member.memories.length} memories shared
            </p>
          )}
        </div>
        <ChevronRight className="text-[var(--color-stone)]" />
      </div>
    </Card>
  );
}

interface MemoryCardProps {
  memory: FamilyMemory;
}

function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className="p-4 bg-[var(--color-sand)] rounded-xl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-terracotta-light)] flex items-center justify-center flex-shrink-0">
          <Heart size={18} className="text-[var(--color-terracotta)]" />
        </div>
        <div>
          <h4 className="font-medium text-[var(--color-charcoal)]">{memory.title}</h4>
          <p className="text-sm text-[var(--color-stone)] mt-1">{memory.description}</p>
          {memory.tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {memory.tags.map(tag => (
                <span 
                  key={tag}
                  className="text-xs px-2 py-1 bg-[var(--color-warm-white)] rounded-full text-[var(--color-stone)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


interface FamilyMemberDetailProps {
  member: FamilyMember;
  onBack: () => void;
  onRemove?: () => void;
}

function FamilyMemberDetail({ member, onBack, onRemove }: FamilyMemberDetailProps) {
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryDesc, setNewMemoryDesc] = useState('');
  const { user, addFamilyMemory } = useStore();
  
  // Get the updated member from the store to reflect changes
  const currentMember = user?.familyMembers?.find(m => m.id === member.id) || member;
  
  const initials = currentMember.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleAddMemory = () => {
    if (!newMemoryTitle || !newMemoryDesc) return;
    
    addFamilyMemory(currentMember.id, {
      id: crypto.randomUUID(),
      title: newMemoryTitle,
      description: newMemoryDesc,
      tags: []
    });
    
    setNewMemoryTitle('');
    setNewMemoryDesc('');
    setShowAddMemory(false);
  };

  return (
    <div className="space-y-4">
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
              if (confirm(`Are you sure you want to remove ${currentMember.name} from your family members?`)) {
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
            {currentMember.name}
          </h2>
          <p className="text-[var(--color-stone)]">{currentMember.relationship}</p>
        </div>
      </Card>
      
      {/* Recent updates */}
      {currentMember.recentUpdates.length > 0 && (
        <Card>
          <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-3 flex items-center gap-2">
            <MessageCircle size={18} className="text-[var(--color-sage)]" />
            Recent Updates
          </h3>
          <div className="space-y-3">
            {currentMember.recentUpdates.map(update => (
              <div key={update.id} className="p-3 bg-[var(--color-sand)] rounded-xl">
                <p className="text-[var(--color-charcoal)]">{update.content}</p>
                <p className="text-xs text-[var(--color-stone)] mt-2">
                  From {update.author} • {new Date(update.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Memories */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-[var(--color-charcoal)] flex items-center gap-2">
            <Heart size={18} className="text-[var(--color-terracotta)]" />
            Shared Memories
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => setShowAddMemory(true)}
          >
            Add
          </Button>
        </div>
        
        <AnimatePresence>
          {showAddMemory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="p-4 bg-[var(--color-sand)] rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-[var(--color-charcoal)]">New Memory</h4>
                  <button onClick={() => setShowAddMemory(false)}>
                    <X size={18} className="text-[var(--color-stone)]" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  placeholder="Memory title..."
                  className="w-full p-3 rounded-lg border border-[var(--color-sage-light)] outline-none focus:border-[var(--color-sage)]"
                />
                <textarea
                  value={newMemoryDesc}
                  onChange={(e) => setNewMemoryDesc(e.target.value)}
                  placeholder="Describe this memory in simple words..."
                  className="w-full p-3 rounded-lg border border-[var(--color-sage-light)] outline-none focus:border-[var(--color-sage)] min-h-[100px] resize-none"
                />
                <Button 
                  onClick={handleAddMemory} 
                  disabled={!newMemoryTitle || !newMemoryDesc}
                  fullWidth
                >
                  Save Memory
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="space-y-3">
          {currentMember.memories.length > 0 ? (
            currentMember.memories.map(memory => (
              <MemoryCard key={memory.id} memory={memory} />
            ))
          ) : (
            <p className="text-center text-[var(--color-stone)] py-6">
              No memories shared yet. Add one to help with conversations!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

interface AddFamilyMemberFormProps {
  onAdd: (member: FamilyMember) => void;
  onCancel: () => void;
}

function AddFamilyMemberForm({ onAdd, onCancel }: AddFamilyMemberFormProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    if (!name || !relationship || !username.trim()) return;
    
    onAdd({
      id: crypto.randomUUID(),
      name,
      relationship,
      username: username.trim(),
      memories: [],
      recentUpdates: []
    });
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
          Add Family Member
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
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Their Sage username..."
            className="w-full p-3 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none"
          />
          <p className="text-xs text-[var(--color-stone)] mt-1">
            Enter their username to connect accounts and enable sharing
          </p>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!name || !relationship || !username.trim()}
          fullWidth
        >
          Add Family Member
        </Button>
      </div>
    </Card>
  );
}

export function FamilyHub() {
  const { user, addFamilyMember, removeFamilyMember, receivedHealthEntries, sentHealthEntries, markSharedHealthEntryRead, currentUserId } = useStore();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReceivedEntries, setShowReceivedEntries] = useState(false);
  const [showSentEntries, setShowSentEntries] = useState(false);
  
  // Only use actual user family members (no hardcoded data)
  const familyMembers = user?.familyMembers || [];
  const unreadReceivedEntries = receivedHealthEntries?.filter(e => !e.read) || [];
  
  // Get recipient names for sent entries
  const getRecipientName = (entry: SharedHealthEntry) => {
    if (!entry.toUsername) return 'Unknown';
    const member = familyMembers.find(m => m.username?.toLowerCase() === entry.toUsername?.toLowerCase());
    return member?.name || entry.toUsername;
  };

  const handleAddMember = (member: FamilyMember) => {
    addFamilyMember(member);
    setShowAddForm(false);
  };

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  const handleRemoveMember = (memberId: string) => {
    removeFamilyMember(memberId);
    setSelectedMember(null);
  };

  // View for received health entries
  if (showReceivedEntries) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
              Received Health Updates
            </h2>
            <p className="text-[var(--color-stone)]">
              Health information shared with you
            </p>
          </div>
          <button
            onClick={() => setShowReceivedEntries(false)}
            className="p-2 rounded-xl hover:bg-[var(--color-sand)] transition-colors"
          >
            <ChevronRight size={24} className="text-[var(--color-stone)] rotate-180" />
          </button>
        </div>

        {receivedHealthEntries.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart size={48} className="text-[var(--color-sage)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--color-stone)]">No received health updates yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {receivedHealthEntries.map((sharedEntry: SharedHealthEntry) => (
              <Card
                key={sharedEntry.id}
                className={`p-6 ${!sharedEntry.read ? 'border-2 border-[var(--color-sage)]' : ''}`}
                onClick={() => markSharedHealthEntryRead(sharedEntry.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-[var(--color-charcoal)]">
                          From {sharedEntry.fromName}
                        </p>
                        {!sharedEntry.read && (
                          <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]"></span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-stone)]">
                        {new Date(sharedEntry.timestamp).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-sand)]">
                    <h4 className="font-medium text-[var(--color-charcoal)] mb-2">
                      Primary Concern
                    </h4>
                    <p className="text-[var(--color-stone)] mb-4">
                      {sharedEntry.healthEntry.primaryConcern}
                    </p>

                    {sharedEntry.healthEntry.followUpQuestions.length > 0 && (
                      <div className="space-y-3">
                        {sharedEntry.healthEntry.followUpQuestions.map((qa, index) => (
                          <div key={index} className="p-3 bg-[var(--color-sand)] rounded-xl">
                            <p className="text-sm font-medium text-[var(--color-stone)] mb-1">
                              {qa.question}
                            </p>
                            <p className="text-[var(--color-charcoal)]">{qa.response}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View for sent health entries
  if (showSentEntries) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
              Sent Health Updates
            </h2>
            <p className="text-[var(--color-stone)]">
              Health information you've shared
            </p>
          </div>
          <button
            onClick={() => setShowSentEntries(false)}
            className="p-2 rounded-xl hover:bg-[var(--color-sand)] transition-colors"
          >
            <ChevronRight size={24} className="text-[var(--color-stone)] rotate-180" />
          </button>
        </div>

        {sentHealthEntries.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart size={48} className="text-[var(--color-sage)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--color-stone)]">No sent health updates yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sentHealthEntries.map((sharedEntry: SharedHealthEntry) => {
              // Find recipient by matching username
              const recipient = familyMembers.find(m => 
                m.username?.toLowerCase() === sharedEntry.toUsername?.toLowerCase()
              );
              
              return (
                <Card key={sharedEntry.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-[var(--color-charcoal)] mb-1">
                          Shared with {recipient?.name || sharedEntry.toUsername || 'Unknown'}
                        </p>
                        <p className="text-sm text-[var(--color-stone)]">
                          {new Date(sharedEntry.timestamp).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--color-sand)]">
                      <h4 className="font-medium text-[var(--color-charcoal)] mb-2">
                        Primary Concern
                      </h4>
                      <p className="text-[var(--color-stone)] mb-4">
                        {sharedEntry.healthEntry.primaryConcern}
                      </p>

                      {sharedEntry.healthEntry.followUpQuestions.length > 0 && (
                        <div className="space-y-3">
                          {sharedEntry.healthEntry.followUpQuestions.map((qa, index) => (
                            <div key={index} className="p-3 bg-[var(--color-sand)] rounded-xl">
                              <p className="text-sm font-medium text-[var(--color-stone)] mb-1">
                                {qa.question}
                              </p>
                              <p className="text-[var(--color-charcoal)]">{qa.response}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (selectedMember) {
    // Get the latest member from store if it exists, otherwise use the selected one
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
            People and memories that matter
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={16} />}
          onClick={() => setShowAddForm(true)}
        >
          Add
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AddFamilyMemberForm 
              onAdd={handleAddMember}
              onCancel={() => setShowAddForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 stagger-children">
        {familyMembers.map(member => (
          <FamilyMemberCard
            key={member.id}
            member={member as FamilyMember}
            onClick={() => handleSelectMember(member as FamilyMember)}
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
            Add family members to personalize conversations and share memories.
          </p>
          <Button onClick={() => setShowAddForm(true)} icon={<Plus size={18} />}>
            Add Family Member
          </Button>
        </Card>
      )}
    </div>
  );
}

