import React from "react";
import { Users, Building2, FileText, CreditCard } from "lucide-react";
import {
  useCourses,
  usePayments,
  useEnquiries,
  useAssessments,
  useUniversities,
  useApplications,
} from "../hooks/useFirestore";
import moment from "moment";
import { useAuth } from "../context/AuthContext";
import Stats from "../components/Dashboard/Stats";
import QuickAction from "../components/Dashboard/QuickAction";
import PendingTasks from "../components/Dashboard/PendingTasks";
import MonthPerformance from "../components/Dashboard/MonthPerformance";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: courses } = useCourses();
  const { data: payments } = usePayments();
  const { data: enquiries } = useEnquiries();
  const { data: assessments } = useAssessments();
  const { data: universities } = useUniversities();
  const { data: applications } = useApplications();

  const totalRevenue = payments
    .filter((payment) => payment.payment_status === "Paid")
    .reduce((sum, payment) => sum + parseFloat(payment.payment_amount || 0), 0);

  const newEnquiriesLast7Days = enquiries.filter((enquiry) => {
    if (!enquiry.createdAt) return false;
    const enquiryDate = moment(enquiry.createdAt.toDate());
    return enquiryDate.isSameOrAfter(moment().subtract(7, "days"), "day");
  }).length;

  const totalActiveUniversities = universities.filter(
    (uni) => uni.Active
  ).length;
  const totalActiveApplications = applications.filter((app) =>
    ["Submitted", "Under Review", "Interview Scheduled"].includes(
      app.application_status
    )
  ).length;

  const stats = [
    {
      name: "Total Students",
      value: enquiries.length.toString(),
      change: `+${newEnquiriesLast7Days}`,
      changeType: "increase",
      changeText: "new this week",
      icon: Users,
      color: "bg-blue-500",
      href: "/students",
    },
    {
      name: "Active Universities",
      value: totalActiveUniversities.toString(),
      change: `${universities.length}`,
      changeType: "neutral",
      changeText: "total partnerships",
      icon: Building2,
      color: "bg-green-500",
      href: "/universities",
    },
    {
      name: "Active Applications",
      value: totalActiveApplications.toString(),
      change: `${applications.length}`,
      changeType: "neutral",
      changeText: "total applications",
      icon: FileText,
      color: "bg-purple-500",
      href: "/applications",
    },
    {
      name: "Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      change: "+15%",
      changeType: "increase",
      changeText: "from target",
      icon: CreditCard,
      color: "bg-yellow-500",
      href: "/payments",
    },
  ];

  const getRecentActivities = () => {
    const activities = [];

    enquiries
      .filter((enquiry) => enquiry.createdAt)
      .sort(
        (a, b) =>
          moment(b.createdAt.toDate()).valueOf() -
          moment(a.createdAt.toDate()).valueOf()
      )
      .slice(0, 3)
      .forEach((enquiry) => {
        activities.push({
          id: `enquiry-${enquiry.id}`,
          type: "enquiry",
          message: `New enquiry from ${enquiry.student_First_Name} ${enquiry.student_Last_Name}`,
          time: moment(enquiry.createdAt.toDate()),
          icon: Users,
        });
      });

    applications
      .filter((app) => app.createdAt)
      .sort(
        (a, b) =>
          moment(b.createdAt.toDate()).valueOf() -
          moment(a.createdAt.toDate()).valueOf()
      )
      .slice(0, 2)
      .forEach((app) => {
        activities.push({
          id: `application-${app.id}`,
          type: "application",
          message: `Application submitted for assessment`,
          time: moment(app.createdAt.toDate()),
          icon: FileText,
        });
      });

    payments
      .filter(
        (payment) => payment.payment_date && payment.payment_status === "Paid"
      )
      .sort(
        (a, b) =>
          moment(b.payment_date).valueOf() - moment(a.payment_date).valueOf()
      )
      .slice(0, 2)
      .forEach((payment) => {
        activities.push({
          id: `payment-${payment.id}`,
          type: "payment",
          message: `Payment received of ₹${parseFloat(
            payment.payment_amount
          ).toLocaleString()}`,
          time: moment(payment.payment_date),
          icon: CreditCard,
        });
      });

    return activities
      .sort((a, b) => b.time.valueOf() - a.time.valueOf())
      .slice(0, 5);
  };

  const formatActivityTime = (date) => {
    if (moment(date).isSame(moment(), "day")) {
      return moment(date).format("HH:mm");
    } else if (moment(date).isSame(moment().subtract(1, "day"), "day")) {
      return "Yesterday";
    } else {
      return moment(date).format("MMM DD");
    }
  };

  const recentActivities = getRecentActivities();

  const getPendingTasks = () => {
    const newEnquiries = enquiries.filter(
      (enq) => enq.enquiry_status === "New"
    ).length;
    const pendingAssessments = assessments.filter(
      (ass) => ass.ass_status === "Pending"
    ).length;
    const pendingPayments = payments.filter(
      (pay) => pay.payment_status === "Pending"
    ).length;

    return {
      followUps: newEnquiries,
      pendingApplications: pendingAssessments,
      paymentsDue: pendingPayments,
    };
  };

  const pendingTasks = getPendingTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.displayName?.split(" ")[0]}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your education consultancy today.
        </p>
      </div>
      <Stats stats={stats} />
      <QuickAction
        recentActivities={recentActivities}
        formatActivityTime={formatActivityTime}
      />
      <PendingTasks pendingTasks={pendingTasks} />
      <MonthPerformance
        newEnquiriesLast7Days={newEnquiriesLast7Days}
        totalActiveUniversities={totalActiveUniversities}
        totalActiveApplications={totalActiveApplications}
        totalRevenue={totalRevenue}
        enquiries={enquiries}
        universities={universities}
        applications={applications}
        payments={payments}
        courses={courses}
        assessments={assessments}
      />
    </div>
  );
};

export default Dashboard;
