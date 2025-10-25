import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { messagesApi, usersApi } from '../utils/api';
import { MessageSquare, Send, Paperclip, ArrowLeft, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ChatSystemProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'signup', role?: 'supplier' | 'buyer') => void;
}

export function ChatSystem({ onNavigate, onOpenAuth }: ChatSystemProps) {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      onOpenAuth('login');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversationId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoadingData(true);
      const { conversations: convData } = await messagesApi.getAll();
      setConversations(convData || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingData(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { messages: msgData } = await messagesApi.getAll(conversationId);
      setMessages(msgData || []);
      
      // Mark unread messages as read
      const unreadMessages = msgData.filter((m: any) => !m.read && m.receiverId === user?.id);
      for (const msg of unreadMessages) {
        await messagesApi.markRead(msg.id);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !offerPrice) return;

    try {
      const otherUserId = selectedConversation.lastMessage.senderId === user?.id
        ? selectedConversation.lastMessage.receiverId
        : selectedConversation.lastMessage.senderId;

      await messagesApi.send({
        receiverId: otherUserId,
        content: newMessage.trim() || `Price offer: ₹${offerPrice}`,
        conversationId: selectedConversation.conversationId,
        offerPrice: offerPrice ? parseFloat(offerPrice) : undefined,
      });

      setNewMessage('');
      setOfferPrice('');
      setShowOfferInput(false);
      loadMessages(selectedConversation.conversationId);
      loadConversations();
      toast.success('Message sent');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const getOtherUserName = (conversation: any) => {
    const lastMsg = conversation.lastMessage;
    return lastMsg.senderId === user?.id ? 'Buyer' : 'Supplier';
  };

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Chat with buyers and suppliers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.conversationId}
                        onClick={() => setSelectedConversation(conv)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.conversationId === conv.conversationId
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-gray-900">{getOtherUserName(conv)}</p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-green-600 text-white">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap">
                          {conv.lastMessage.content}
                        </p>
                        <p className="text-gray-400 mt-1">
                          {new Date(conv.lastMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {!selectedConversation ? (
              <CardContent className="flex items-center justify-center h-[680px]">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a conversation to start chatting</p>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle>{getOtherUserName(selectedConversation)}</CardTitle>
                      <p className="text-gray-500">
                        Conversation ID: {selectedConversation.conversationId.slice(0, 20)}...
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Messages */}
                  <ScrollArea className="h-[480px] p-6">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-12">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isOwnMessage = message.senderId === user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-4 ${
                                  isOwnMessage
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                {message.offerPrice && (
                                  <div
                                    className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                                      isOwnMessage ? 'border-green-400' : 'border-gray-300'
                                    }`}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                    <span>Price Offer: ₹{message.offerPrice}</span>
                                  </div>
                                )}
                                <p>{message.content}</p>
                                <p
                                  className={`mt-2 ${
                                    isOwnMessage ? 'text-green-100' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <Separator />

                  {/* Input Area */}
                  <div className="p-4">
                    {showOfferInput && (
                      <div className="mb-3 p-3 bg-green-50 rounded-lg">
                        <label className="block text-gray-700 mb-2">
                          Send Price Offer
                        </label>
                        <Input
                          type="number"
                          placeholder="Enter price..."
                          value={offerPrice}
                          onChange={(e) => setOfferPrice(e.target.value)}
                          className="mb-2"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowOfferInput(false);
                            setOfferPrice('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOfferInput(!showOfferInput)}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
