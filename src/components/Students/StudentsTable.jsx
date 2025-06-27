import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  Search,
  Filter,
  Save,
  MessageSquare,
  X,
  Building2,
  UserCheck,
  Loader2,
  Shield,
  PlusCircle,
} from "lucide-react";
import { ENQUIRY_STATUS } from "../../utils/constants";
import { branchService, userService } from "../../services/firestore";
import FollowUpBadge from "../FollowUp/FollowUpBadge";

const InlineNoteEditor = ({
  initialNote = "",
  studentId,
  onSaveNote,
  onCancel,
}) => {
  const [note, setNote] = useState(initialNote);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveNote(studentId, note);
    setIsSaving(false);
  };

  return (
    <div className="absolute z-10 mt-1 w-64 p-2 bg-white border border-gray-300 rounded shadow-lg right-0 sm:right-auto">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="w-full p-1 border border-gray-300 rounded text-sm focus:ring-primary-500 focus:border-primary-500"
        placeholder="Add a note..."
      />
      <div className="flex justify-end space-x-2 mt-2">
        <button
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Cancel"
          disabled={isSaving}
        >
          <X size={16} />
        </button>
        <button
          onClick={handleSave}
          className="p-1 text-primary-600 hover:text-primary-800 disabled:opacity-50"
          title="Save Note"
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          ) : (
            <Save size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

const StudentsTable = ({
  students,
  loading,
  onEdit,
  onDelete,
  onView,
  onUpdateStatus,
  onUpdateNote,
  onUpdateAssignment,
  onOpenFollowUp,
  followUps,
  userRole,
  userBranch,
  handleVisibility,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [editingNoteForStudentId, setEditingNoteForStudentId] = useState(null);

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const getRoleBadge = (role) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    let roleName = "";

    if (role === "Superadmin") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      roleName = "Super Admin";
    } else if (role === "Branch Admin" || role === "Branch Manager") {
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      roleName = "Branch Admin";
    } else if (role === "Counsellor" || role === "Processor") {
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      roleName = role === "Counsellor" ? "Counsellor" : "Processor";
    } else if (role === "Reception" || role === "Accountant") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      roleName = role === "Reception" ? "Receptionist" : "Accountant";
    } else if (role === "Agent") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      roleName = "Agent";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        <Shield size={12} className="mr-1" /> {roleName}
      </span>
    );
  };

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setBranchesLoading(true);
        const fetchedBranches = await branchService.getAll();
        setBranches(fetchedBranches);
        const fetchedUsers = await userService.getAll();
        setUsers(fetchedUsers);
      } catch (error) {
        console.log("error", error);
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  const branchMap = branches.reduce((acc, branch) => {
    acc[branch.id] = branch.branchName;
    return acc;
  }, {});

  const userMap = users.reduce((acc, user) => {
    acc[user.id] = { displayName: user.displayName, role: user.role };
    return acc;
  }, {});

  const getBranchName = (branchId) => {
    if (!branchId) return "No Branch";
    if (branchesLoading) return "Loading...";
    return branchMap[branchId];
  };

  const getCreatedByUserDetails = (userId) => {
    if (!userId) return { displayName: "N/A", role: "N/A" };
    const user = userMap[userId];
    return user;
  };

  const getAvailableUsers = () => {
    if (userRole === "Superadmin" || userRole === "Reception") {
      return users;
    } else if (userRole === "Counsellor") {
      return [];
    } else if (userRole === "Branch Admin" && userBranch) {
      return users.filter(
        (user) => user.branchId === userBranch && user.role === "Counsellor"
      );
    }
    return [];
  };

  const filteredStudents = students
    .filter((student) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        student.student_First_Name?.toLowerCase().includes(searchTermLower) ||
        student.student_Last_Name?.toLowerCase().includes(searchTermLower) ||
        student.student_email?.toLowerCase().includes(searchTermLower) ||
        student.student_phone?.includes(searchTerm);
      const matchesStatus =
        !statusFilter || student.enquiry_status === statusFilter;
      const matchesBranch = !branchFilter || student.branchId === branchFilter;
      const matchesAssignment =
        !assignmentFilter ||
        (assignmentFilter === "unassigned" && !student.assignedUserId) ||
        (assignmentFilter === "assigned" && student.assignedUserId) ||
        student.assignedUserId === assignmentFilter;

      return (
        matchesSearch && matchesStatus && matchesBranch && matchesAssignment
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortField === "createdAt") {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortDirection === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSaveNoteWithClose = async (studentId, newNote) => {
    try {
      if (onUpdateNote) {
        await onUpdateNote(studentId, newNote);
        setEditingNoteForStudentId(null);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleAssignmentChange = async (studentId, newAssignedUserId) => {
    try {
      if (onUpdateAssignment) {
        await onUpdateAssignment(studentId, newAssignedUserId);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(studentId, newStatus);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              {ENQUIRY_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {userRole === "Superadmin" ||
            userRole === "Branch Admin" ||
            (userRole === "Agent" && (
              <div className="relative">
                <Building2
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
            ))}

          {userRole === "Superadmin" ||
            (userRole === "Branch Admin" && (
              <div className="relative">
                <UserCheck
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Assigned To</option>
                  {getAvailableUsers().map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("student_First_Name")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Student Name
                  {sortField === "student_First_Name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="table-header">Contact</th>
              <th className="table-header">Location</th>
              <th className="table-header">Branch</th>
              {(userRole === "Superadmin" || userRole === "Branch Admin") && (
                <th className="table-header">Assigned To</th>
              )}
              <th className="table-header">Education</th>
              <th
                onClick={() => handleSort("enquiry_status")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Status
                  {sortField === "enquiry_status" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="table-header w-48">Notes</th>
              <th className="table-header w-48">Follow Up</th>
              {(userRole === "Superadmin" || userRole === "Branch Admin") && (
                <th className="table-header">Created By</th>
              )}
              <th
                onClick={() => handleSort("createdAt")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Created
                  {sortField === "createdAt" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              {handleVisibility && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="12" className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading students...</p>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan="12"
                  className="table-cell text-center text-gray-500 py-8"
                >
                  <User className="mx-auto mb-2 text-gray-300" size={48} />
                  <p>No students found</p>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                let formattedDate = "N/A";
                if (
                  student.createdAt &&
                  typeof student.createdAt.toDate === "function"
                ) {
                  try {
                    formattedDate = moment(student.createdAt.toDate()).format(
                      "MMM DD,YYYY"
                    );
                  } catch (error) {
                    console.log("Error formatting Firestore date:", error);
                  }
                } else if (student.createdAt) {
                  try {
                    const parsedDate = moment(student.createdAt);
                    if (parsedDate.isValid()) {
                      formattedDate = parsedDate.format("MMM DD,YYYY");
                    } else {
                      formattedDate = "Invalid Date";
                    }
                  } catch (error) {
                    console.error("Error formatting date (other type):", error);
                  }
                }

                const createdByUserDetails = getCreatedByUserDetails(
                  student.createdBy
                );
                const studentFollowUps = followUps?.filter(
                  (f) => f.studentId === student.id
                );
                const latestFollowUp = studentFollowUps?.[0];

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {student.student_First_Name?.[0]}
                              {student.student_Last_Name?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/students/${student.id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
                          >
                            {student.student_First_Name}{" "}
                            {student.student_Last_Name}
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          {student.student_phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          {student.student_email}
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin size={14} className="mr-2 text-gray-400" />
                        <div>
                          <div>{student.student_city}</div>
                          <div className="text-gray-500">
                            {student.student_state}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building2 size={14} className="mr-2 text-gray-400" />
                        <div className="font-medium">
                          {getBranchName(student.branchId)}
                        </div>
                      </div>
                    </td>

                    {(userRole === "Superadmin" ||
                      userRole === "Branch Admin") && (
                      <td className="table-cell">
                        <select
                          value={student.assignedUserId || ""}
                          onChange={(e) =>
                            handleAssignmentChange(student.id, e.target.value)
                          }
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Unassigned</option>
                          {getAvailableUsers().map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.displayName}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}

                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {student.current_education}
                      </div>
                    </td>

                    <td className="table-cell">
                      <select
                        value={student.enquiry_status}
                        onChange={(e) =>
                          handleStatusChange(student.id, e.target.value)
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="" disabled>
                          Select Status
                        </option>
                        {ENQUIRY_STATUS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="table-cell relative">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-xs text-gray-600 truncate w-3/4"
                          title={student.notes}
                        >
                          {student.notes ? (
                            student.notes.length > 30 ? (
                              student.notes.substring(0, 30) + "..."
                            ) : (
                              student.notes
                            )
                          ) : (
                            <span className="italic">No note</span>
                          )}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNoteForStudentId(
                              editingNoteForStudentId === student.id
                                ? null
                                : student.id
                            );
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="Edit Note"
                        >
                          <MessageSquare size={14} />
                        </button>
                      </div>
                      {editingNoteForStudentId === student.id && (
                        <InlineNoteEditor
                          initialNote={student.notes}
                          studentId={student.id}
                          onSaveNote={handleSaveNoteWithClose}
                          onCancel={() => setEditingNoteForStudentId(null)}
                        />
                      )}
                    </td>

                    <td className="table-cell">
                      {latestFollowUp ? (
                        <FollowUpBadge
                          followUp={latestFollowUp}
                          onClick={() =>
                            onOpenFollowUp(student, latestFollowUp)
                          }
                        />
                      ) : (
                        <button
                          onClick={() => onOpenFollowUp(student)}
                          className="text-xs flex items-center text-primary-600 hover:text-primary-800"
                        >
                          <PlusCircle size={14} className="mr-1" />
                          Add Follow Up
                        </button>
                      )}
                    </td>

                    {(userRole === "Superadmin" ||
                      userRole === "Branch Admin") && (
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          <div>{createdByUserDetails?.displayName}</div>
                          <div className="mt-1">
                            {getRoleBadge(createdByUserDetails?.role)}
                          </div>
                        </div>
                      </td>
                    )}

                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {formattedDate}
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center space-x-1">
                        {(userRole === "Superadmin" ||
                          userRole === "Branch Admin" ||
                          userRole === "Counsellor") && (
                          <button
                            onClick={() => onView(student)}
                            className="p-1 text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {handleVisibility && (
                          <button
                            onClick={() => onEdit(student)}
                            className="p-1 text-yellow-600 hover:text-yellow-900"
                            title="Edit Student"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {userRole === "Superadmin" && (
                          <button
                            onClick={() => onDelete(student.id)}
                            className="p-1 text-red-600 hover:text-red-900"
                            title="Delete Student"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;
