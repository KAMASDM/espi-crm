import React from "react";
import { Trophy } from "lucide-react";
import NestedDetailsCard from "./NestedDetailsCard";

const ExamScoresSection = ({ selectedDetailEnquiry }) => (
  <>
    <NestedDetailsCard
      icon={Trophy}
      title="IELTS Exam"
      detailsObject={selectedDetailEnquiry.ielts_exam}
    />
    <NestedDetailsCard
      icon={Trophy}
      title="TOEFL Exam"
      detailsObject={selectedDetailEnquiry.toefl_exam}
    />
    <NestedDetailsCard
      icon={Trophy}
      title="PTE Exam"
      detailsObject={selectedDetailEnquiry.pte_exam}
    />
    <NestedDetailsCard
      icon={Trophy}
      title="Duolingo Exam"
      detailsObject={selectedDetailEnquiry.duolingo_exam}
    />
    <NestedDetailsCard
      icon={Trophy}
      title="GRE Exam"
      detailsObject={selectedDetailEnquiry.gre_exam}
    />
    <NestedDetailsCard
      icon={Trophy}
      title="GMAT Exam"
      detailsObject={selectedDetailEnquiry.gmat_exam}
    />
  </>
);

export default ExamScoresSection;
