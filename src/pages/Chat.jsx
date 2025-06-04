import React, { useState } from "react";
import { useChats } from "../hooks/useChat";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Common/Loading";
import { formatDistanceToNowStrict } from "date-fns";
import ChatWindow from "../components/Chat/ChatWindow";
import NewChatModal from "../components/Chat/NewChatModal";
import { Search, Plus, Users, MessageSquare, Hash } from "lucide-react";

const Chat = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const { chats, loading: chatsLoading, error: chatsError } = useChats();

  const filteredChats = chats.filter((chat) => {
    if (chat.type === "direct") {
      const otherMemberId = chat.members.find((id) => id !== currentUser?.uid);
      const otherMemberInfo = chat.memberInfo?.[otherMemberId];
      return otherMemberInfo?.displayName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    }
    return chat.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return formatDistanceToNowStrict(timestamp.toDate(), { addSuffix: true });
  };

  const handleChatCreated = (newChatData) => {
    const chatToSelect = chats.find((c) => c.id === newChatData.id) || {
      id: newChatData.id,
      ...newChatData,
    };
    setSelectedChat(chatToSelect);
    setShowNewChatModal(false);
  };

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loading />
      </div>
    );
  }

  if (chatsError) {
    return <div className="p-4 text-red-600">{chatsError.message}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div
        className={`flex flex-col w-full md:w-80 border-r border-gray-200 ${
          selectedChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="New chat"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 mt-10">
              <MessageSquare className="mx-auto mb-2 text-gray-300" size={48} />
              <p className="text-sm">No conversations found.</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 text-sm text-primary-600 hover:underline"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map((chat) => {
                const unreadCount = chat.unreadCount?.[currentUser?.uid] || 0;
                let chatName = chat.name;
                let chatAvatarInitial = chat.name?.[0]?.toUpperCase() || "?";
                let AvatarIcon = Hash;
                let avatarBg = "bg-purple-100";
                let avatarText = "text-purple-600";

                if (chat.type === "direct") {
                  const otherMemberId = chat.members.find(
                    (id) => id !== currentUser?.uid
                  );
                  const otherMemberInfo = chat.memberInfo?.[otherMemberId];
                  chatName = otherMemberInfo?.displayName || "Unknown User";
                  chatAvatarInitial =
                    otherMemberInfo?.displayName?.[0]?.toUpperCase() || "U";
                  AvatarIcon = Users;
                  avatarBg = "bg-blue-100";
                  avatarText = "text-blue-600";
                }
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id
                        ? "bg-primary-50 border-r-2 border-primary-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${avatarBg}`}
                        >
                          {chat.type === "direct" &&
                          chat.memberInfo?.[
                            chat.members.find((id) => id !== currentUser?.uid)
                          ]?.photoURL ? (
                            <img
                              src={
                                chat.memberInfo[
                                  chat.members.find(
                                    (id) => id !== currentUser?.uid
                                  )
                                ].photoURL
                              }
                              alt={chatName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <AvatarIcon className={`${avatarText}`} size={18} />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-sm font-medium truncate ${
                              unreadCount > 0
                                ? "text-gray-900 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {chatName}
                          </h3>
                          {chat.lastMessageTimestamp && (
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatTime(chat.lastMessageTimestamp)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p
                            className={`text-xs truncate ${
                              unreadCount > 0
                                ? "text-gray-700 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {chat.lastMessageText}
                          </p>
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className={`flex-1 ${selectedChat ? "flex" : "hidden md:flex"}`}>
        <ChatWindow
          selectedChat={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      </div>
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={handleChatCreated}
        />
      )}
    </div>
  );
};

export default Chat;
