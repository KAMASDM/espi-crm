import React from "react";
import { MessageSquare } from "lucide-react";

const NoteSection = ({ title, notes, usersMap }) => {
  const notesArray = Array.isArray(notes) ? notes : notes ? [notes] : [];

  if (notesArray.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
        {title}
      </h3>
      <ul className="space-y-3">
        {notesArray.map((note, index) => {
          const noteText = typeof note === "string" ? note : note.text;
          const creatorId = note.createdBy;
          const creatorName =
            usersMap[creatorId]?.displayName || "Unknown User";

          if (!noteText) return null;

          return (
            <li key={index} className="flex items-start text-gray-700">
              <MessageSquare
                size={16}
                className="mr-3 mt-1 text-gray-400 flex-shrink-0"
              />
              <div className="flex-grow">
                <p className="flex-1">{noteText}</p>
                <p className="text-xs text-gray-500 mt-1">— {creatorName}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const NotesTab = ({
  student,
  studentAssessments,
  studentApplications,
  usersMap,
}) => {
  const enquiryNotes = student?.notes
    ? [{ text: student.notes, createdBy: student.createdBy }]
    : [];
  const assessmentNotes =
    studentAssessments
      ?.filter((a) => a.notes)
      .map((a) => ({ text: a.notes, createdBy: a.createdBy })) || [];
  const applicationNotes =
    studentApplications
      ?.filter((app) => app.notes)
      .map((app) => ({ text: app.notes, createdBy: app.createdBy })) || [];

  const allNotes = [...enquiryNotes, ...assessmentNotes, ...applicationNotes];

  if (allNotes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700">No Notes Found</h3>
        <p className="text-gray-500 mt-2">
          There are no notes added for this student yet across any section.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <NoteSection
        title="Enquiry Notes"
        notes={enquiryNotes}
        usersMap={usersMap}
      />
      <NoteSection
        title="Assessment Notes"
        notes={assessmentNotes}
        usersMap={usersMap}
      />
      <NoteSection
        title="Application Notes"
        notes={applicationNotes}
        usersMap={usersMap}
      />
    </div>
  );
};

export default NotesTab;
