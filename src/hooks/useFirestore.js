import { useState, useEffect, useCallback } from "react";
import {
  firestoreService,
  enquiryService,
  universityService,
  courseService,
  assessmentService,
  applicationService,
  visaApplicationService,
  paymentService,
  userService,
  branchService,
  detailEnquiryService,
  serviceService,
  applicationStatusService,
  visaDocumentService,
  followUpService,
  countryService,
} from "../services/firestore";
import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../utils/constants";
import { where, orderBy } from "firebase/firestore";

const useSubscription = (
  collectionName,
  defaultOrderByArgs,
  buildConstraintsFn
) => {
  const { userProfile } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (buildConstraintsFn && !userProfile) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);
    let constraints = defaultOrderByArgs
      ? [orderBy(defaultOrderByArgs[0], defaultOrderByArgs[1])]
      : [];

    let blockAccess = false;
    if (buildConstraintsFn && userProfile) {
      try {
        const dynamicConstraints = buildConstraintsFn(userProfile);
        if (dynamicConstraints === null) {
          blockAccess = true;
        } else if (Array.isArray(dynamicConstraints)) {
          constraints = [...constraints, ...dynamicConstraints];
        }
      } catch (err) {
        console.error("Error building constraints:", err);
        blockAccess = true;
      }
    } else if (buildConstraintsFn && !userProfile) {
      blockAccess = true;
    }

    if (blockAccess) {
      setData([]);
      setLoading(false);
      setError(null);
      return () => {};
    }

    const validConstraints = constraints.filter((c) => c != null);

    const unsubscribe = firestoreService.subscribe(
      collectionName,
      (documents) => {
        setData(documents);
        setLoading(false);
        setError(null);
      },
      validConstraints,
      (err) => {
        setError(err);
        setLoading(false);
        setData([]);
      }
    );

    return () => unsubscribe();
  }, [
    collectionName,
    userProfile,
    JSON.stringify(defaultOrderByArgs),
    buildConstraintsFn,
  ]);

  return { data, loading, error };
};

export const useEnquiries = () => {
  const buildConstraints = useCallback((userProfile) => {
    if (!userProfile) return null;

    const constraints = [];
    if (
      userProfile.role === USER_ROLES.SUPERADMIN ||
      userProfile.role === USER_ROLES.AGENT
    ) {
      // No additional filters
    } else if (
      userProfile.branchId &&
      (userProfile.role === USER_ROLES.BRANCH_ADMIN ||
        userProfile.role === USER_ROLES.RECEPTION ||
        userProfile.role === USER_ROLES.COUNSELLOR ||
        userProfile.role === USER_ROLES.PROCESSOR)
    ) {
      constraints.push(where("branchId", "==", userProfile.branchId));
    } else if (userProfile.role === USER_ROLES.COUNSELLOR) {
      constraints.push(where("assignedCounsellorId", "==", userProfile.uid));
      if (userProfile.branchId) {
        constraints.push(where("branchId", "==", userProfile.branchId));
      } else {
        return null;
      }
    } else {
      return null;
    }
    return constraints.filter((c) => c != null);
  }, []);

  const { data, loading, error } = useSubscription(
    "enquiries",
    ["createdAt", "desc"],
    buildConstraints
  );
  return { data, loading, error, ...enquiryService };
};

export const useDetailEnquiries = () => {
  const buildConstraints = useCallback((userProfile) => {
    if (!userProfile) return null;

    const constraints = [];

    if (
      userProfile.role === USER_ROLES.SUPERADMIN ||
      userProfile.role === USER_ROLES.PROCESSOR ||
      userProfile.role === USER_ROLES.BRANCH_ADMIN ||
      userProfile.role === USER_ROLES.COUNSELLOR
    ) {
      return constraints;
    }

    if (
      userProfile.role === USER_ROLES.BRANCH_ADMIN ||
      userProfile.role === USER_ROLES.COUNSELLOR ||
      userProfile.role === USER_ROLES.PROCESSOR
    ) {
      if (userProfile.branchId) {
        constraints.push(where("branchId", "==", userProfile.branchId));
      }
    }

    if (userProfile.role === USER_ROLES.COUNSELLOR) {
      constraints.push(where("createdBy", "==", userProfile.uid));
    }

    return constraints.length ? constraints : null;
  }, []);

  const { data, loading, error } = useSubscription(
    "detailEnquiries",
    ["createdAt", "desc"],
    buildConstraints
  );

  return { data, loading, error, ...detailEnquiryService };
};

export const useUniversities = () => {
  const { data, loading, error } = useSubscription("universities", [
    "univ_name",
    "asc",
  ]);
  return { data, loading, error, ...universityService };
};

export const useCourses = () => {
  const { data, loading, error } = useSubscription("courses", [
    "course_name",
    "asc",
  ]);
  return { data, loading, error, ...courseService };
};

export const useServices = () => {
  const { data, loading, error } = useSubscription("services", [
    "serviceName",
    "asc",
  ]);
  return { data, loading, error, ...serviceService };
};

export const useApplicationStatus = () => {
  const { data, loading, error } = useSubscription("applicationStatus", [
    "applicationStatus",
    "asc",
  ]);
  return { data, loading, error, ...applicationStatusService };
};

export const useAssessments = () => {
  const buildConstraints = useCallback((userProfile) => {
    if (!userProfile) return null;

    const constraints = [];

    if (
      userProfile.role === USER_ROLES.SUPERADMIN ||
      userProfile.role === USER_ROLES.PROCESSOR
    ) {
      // Sees all
    } else if (
      userProfile.branchId &&
      userProfile.role === USER_ROLES.BRANCH_ADMIN
    ) {
      constraints.push(where("branchId", "==", userProfile.branchId));
    } else if (
      userProfile.role === USER_ROLES.COUNSELLOR &&
      userProfile.branchId
    ) {
      constraints.push(where("branchId", "==", userProfile.branchId));
    } else {
      return null;
    }

    return constraints.filter((c) => c != null);
  }, []);

  const { data, loading, error } = useSubscription(
    "assessments",
    ["createdAt", "desc"],
    buildConstraints
  );

  return { data, loading, error, ...assessmentService };
};

export const useApplications = () => {
  const buildConstraints = useCallback((userProfile) => {
    if (!userProfile) return null;

    const constraints = [];

    if (
      userProfile.role === USER_ROLES.SUPERADMIN ||
      userProfile.role === USER_ROLES.PROCESSOR
    ) {
      // Sees all
    } else if (
      userProfile.branchId &&
      userProfile.role === USER_ROLES.BRANCH_ADMIN
    ) {
      constraints.push(where("branchId", "==", userProfile.branchId));
    } else if (
      userProfile.role === USER_ROLES.COUNSELLOR &&
      userProfile.branchId
    ) {
      constraints.push(where("branchId", "==", userProfile.branchId));
    } else {
      return null;
    }

    return constraints.filter((c) => c != null);
  }, []);

  const { data, loading, error } = useSubscription(
    "applications",
    ["createdAt", "desc"],
    buildConstraints
  );

  return { data, loading, error, ...applicationService };
};

export const useVisaApplications = () => {
  const buildConstraints = useCallback((userProfile) => {
    if (!userProfile) return null;

    const constraints = [];

    if (
      userProfile.role === USER_ROLES.SUPERADMIN ||
      userProfile.role === USER_ROLES.PROCESSOR
    ) {
      // No additional constraints needed
    } else if (
      userProfile.branchId &&
      (userProfile.role === USER_ROLES.BRANCH_ADMIN ||
        userProfile.role === USER_ROLES.COUNSELLOR)
    ) {
      constraints.push(where("branchId", "==", userProfile.branchId));
    } else {
      return null;
    }

    return constraints.filter((c) => c != null);
  }, []);

  const { data, loading, error } = useSubscription(
    "visaApplications",
    ["createdAt", "desc"],
    buildConstraints
  );

  return { data, loading, error, ...visaApplicationService };
};

export const useVisaDocuments = () => {
  const { data, loading, error } = useSubscription("visaDocumentRequirements", [
    "countryCode",
    "asc",
  ]);

  return {
    data,
    loading,
    error,
    ...visaDocumentService,
  };
};

export const usePayments = () => {
  const buildConstraints = useCallback((userProfile) => {
    if (!userProfile) return null;

    const constraints = [];
    if (
      userProfile.role === USER_ROLES.SUPERADMIN ||
      userProfile.role === USER_ROLES.ACCOUNTANT ||
      userProfile.role === USER_ROLES.RECEPTION
    ) {
      // Sees all
    } else if (
      userProfile.branchId &&
      (userProfile.role === USER_ROLES.BRANCH_ADMIN ||
        userProfile.role === USER_ROLES.ACCOUNTANT ||
        userProfile.role === USER_ROLES.RECEPTION)
    ) {
      constraints.push(where("branchId", "==", userProfile.branchId));
    } else {
      return null;
    }
    return constraints.filter((c) => c != null);
  }, []);

  const { data, loading, error } = useSubscription(
    "payments",
    ["payment_date", "desc"],
    buildConstraints
  );
  return { data, loading, error, ...paymentService };
};

export const useUsers = () => {
  const buildConstraints = useCallback((userProfile) => {
    if (!userProfile) return null;

    return [];
  }, []);

  const { data, loading, error } = useSubscription(
    "users",
    ["displayName", "asc"],
    buildConstraints
  );
  return { data, loading, error, ...userService };
};

export const useBranches = () => {
  const buildConstraints = useCallback((userProfile) => {
    if (!userProfile) return null;

    if (userProfile.role !== USER_ROLES.SUPERADMIN) {
      return null;
    }
    return [];
  }, []);

  const { data, loading, error } = useSubscription(
    "branches",
    ["branchName", "asc"],
    buildConstraints
  );
  return { data, loading, error, ...branchService };
};

export const useFollowUps = () => {
  const { data, loading, error } = useSubscription("followUps", [
    "nextFollowUpDate",
    "desc",
  ]);
  return { data, loading, error, ...followUpService };
};

export const useDocument = (collectionName, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    let isMounted = true;

    const fetchDocument = async () => {
      try {
        const documentData = await firestoreService.getById(collectionName, id);
        if (isMounted) {
          setData(documentData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDocument();
    return () => {
      isMounted = false;
    };
  }, [collectionName, id]);

  return { data, loading, error };
};

export const useCountries = () => {
  const { data, loading, error } = useSubscription("countries", [
    "country",
    "asc",
  ]);
  return { data, loading, error, ...countryService };
};
