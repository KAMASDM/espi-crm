import React, { useState } from "react";
import {
  X,
  Check,
  Search,
  Users as GroupIcon,
  User as DirectIcon,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChatUsers } from "../../hooks/useChat";
import { useAuth } from "../../context/AuthContext";
import { chatService } from "../../services/firestore";
import Loading from "../Common/Loading";

const NewChatModal = ({ onClose, onChatCreated }) => {
  const { user: currentUser } = useAuth();
  const { users: availableUsers, loading: usersLoading } = useChatUsers();

  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chatType, setChatType] = useState("direct");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleUserSelect = (userId) => {
    if (chatType === "direct") {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      console.log("Authentication error.");
      return;
    }
    if (selectedUsers.length === 0) {
      console.log("Please select at least one user.");
      return;
    }
    if (chatType === "group" && !groupName.trim()) {
      console.log("Please enter a group name.");
      return;
    }

    setIsCreating(true);
    try {
      let members = [];
      let memberInfo = {};

      if (chatType === "direct") {
        if (selectedUsers.length !== 1) {
          console.log("Please select exactly one user for a direct chat.");
          setIsCreating(false);
          return;
        }
        members = [currentUser.uid, selectedUsers[0]];
        const otherUser = availableUsers.find((u) => u.id === selectedUsers[0]);
        memberInfo = {
          [currentUser.uid]: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [selectedUsers[0]]: {
            displayName: otherUser?.displayName,
            photoURL: otherUser?.photoURL,
          },
        };
      } else {
        members = [currentUser.uid, ...selectedUsers];
        memberInfo[currentUser.uid] = {
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        };
        selectedUsers.forEach((uid) => {
          const user = availableUsers.find((u) => u.id === uid);
          if (user) {
            memberInfo[uid] = {
              displayName: user.displayName,
              photoURL: user.photoURL,
            };
          }
        });
      }

      const chatData = {
        type: chatType,
        name: chatType === "group" ? groupName : "",
        members: [...new Set(members)],
        memberInfo,
      };

      const result = await chatService.createChat(chatData);
      toast.success(
        result.existing
          ? "Direct chat already exists."
          : "Chat created successfully!"
      );
      onChatCreated(result);
      onClose();
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            New Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setChatType("direct");
                    setSelectedUsers([]);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    chatType === "direct"
                      ? "bg-blue-500 text-white border-blue-500 shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <DirectIcon size={16} className="mr-2" /> Direct Message
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatType("group");
                    setSelectedUsers([]);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    chatType === "group"
                      ? "bg-purple-500 text-white border-purple-500 shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <GroupIcon size={16} className="mr-2" /> Group Chat
                </button>
              </div>
            </div>

            {chatType === "group" && (
              <div>
                <label
                  htmlFor="groupName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Group Name
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-1 input-field"
                  placeholder="Enter group name (e.g., Project Alpha)"
                  required={chatType === "group"}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {chatType === "direct" ? "Select User" : "Select Members"}
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field mb-2"
                />
              </div>
              <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                {usersLoading ? (
                  <Loading size="default" />
                ) : filteredUsers.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No users found.
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <Check size={20} className="text-blue-500" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isCreating}
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={
                isCreating ||
                selectedUsers.length === 0 ||
                (chatType === "group" && !groupName.trim())
              }
            >
              <Save size={16} className="inline mr-1" />
              {isCreating ? "Creating..." : "Create Chat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal;
