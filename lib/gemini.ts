import {GoogleGenerativeAI} from '@google/generative-ai';
import { Document } from '@langchain/core/documents';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({
    model:'gemini-1.5-flash'
});
export const aiSummariseCommit = async (diff:string)=>{
    const response = await model.generateContent([
        `You are an expert programmer and you are trying to summarise a git diff which is given as diff --git a/src/Components/Forms/TimeScheduleForm.js b/src/Components/Forms/TimeScheduleForm.js
index 0540175..0f763db 100644
--- a/src/Components/Forms/TimeScheduleForm.js
+++ b/src/Components/Forms/TimeScheduleForm.js
@@ -5,7 +5,7 @@ import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
 import { toast } from "react-toastify";
 import { TableHeader } from "../Table";
 import Loading from "../Layouts/Loading";
-import ErrorStrip from "../ErrorStrip";
+// import ErrorStrip from "../ErrorStrip";
 import { dummyUsers } from "../../data/users";
 import { dummyPapers } from "../../data/papers";
 import { dummyTimeSchedule } from "../../data/timeSchedule";
@@ -20,8 +20,8 @@ const TimeScheduleForm = () => {
   
   const [timeSchedule, setTimeSchedule] = useState({});
   const [disabled, setDisabled] = useState(true);
-  const [id, setId] = useState("");
-  const [error, setError] = useState("");
+  // const [id, setId] = useState("");
+  // const [error, setError] = useState("");
 
   // updating attendance state on "onChange" event.
   const handleFormChange = (e) => {
@@ -47,7 +47,7 @@ const TimeScheduleForm = () => {
         // Use dummy data for development/testing
         setDisabled(false);
         setTimeSchedule(dummyTimeSchedule);
-        setId("dummy-schedule-id");
+        // setId("dummy-schedule-id");
         return;
       }
 
@@ -209,7 +209,7 @@ const TimeScheduleForm = () => {
           </button>
         )}
       </form>
-      {error ? <ErrorStrip error={error} /> : ""}
+      {/* {error ? <ErrorStrip error={error} /> : ""} */}
     </main>
   );
 };
diff --git a/src/Components/Queries/InternalStudent.js b/src/Components/Queries/InternalStudent.js
index 21e2332..6da44da 100644
--- a/src/Components/Queries/InternalStudent.js
+++ b/src/Components/Queries/InternalStudent.js
@@ -18,24 +18,35 @@ const InternalStudent = () => {
   
   const [internal, setInternal] = React.useState([]);
   const [error, setError] = React.useState("");
+  const [selectedPaper, setSelectedPaper] = React.useState("");
+  const [filteredInternal, setFilteredInternal] = React.useState([]);
 
   React.useEffect(() => {
     const fetchInternal = async () => {
       if (useDummyData) {
         // Use dummy data for development/testing
-        console.log("Loading dummy internal marks data");
         setInternal(dummyInternalMarks);
         toast.success("Dummy internal marks data loaded!");
         return;
       }
-
-      // Original API call logic would go here when useDummyData is false
       setInternal([]);
       setError({ message: "API calls disabled - using dummy data only" });
     };
     fetchInternal();
   }, [user, useDummyData]);
 
+  // Filter internal marks when Fetch is clicked
+  const handleFetch = (e) => {
+    e.preventDefault();
+    if (!selectedPaper) {
+      setFilteredInternal([]);
+      return;
+    }
+    setFilteredInternal(
+      internal.filter((item) => item.paper.paper === selectedPaper)
+    );
+  };
+
   return (
     <main className="internal">
       <div className="flex items-center gap-4 mb-4">
@@ -50,8 +61,27 @@ const InternalStudent = () => {
       <h2 className="mb-2 mt-3 whitespace-break-spaces text-4xl font-bold text-violet-950 underline decoration-inherit decoration-2 underline-offset-4 dark:mt-0 dark:text-slate-400 md:text-6xl">
         Internal Mark
       </h2>
+      <form className="flex gap-4 mb-6" onSubmit={handleFetch}>
+        <select
+          className="rounded p-2 border border-violet-400"
+          value={selectedPaper}
+          onChange={e => setSelectedPaper(e.target.value)}
+          required
+        >
+          <option value="" disabled>Select Paper</option>
+          {internal.map((item, idx) => (
+            <option key={idx} value={item.paper.paper}>{item.paper.paper}</option>
+          ))}
+        </select>
+        <button
+          type="submit"
+          className="px-6 py-2 rounded bg-violet-700 text-white font-semibold hover:bg-violet-900"
+        >
+          Fetch
+        </button>
+      </form>
       <div>{error ? <ErrorStrip error={error} /> : ""}</div>
-      {internal.length ? (
+      {filteredInternal.length ? (
         <section className="my-4 w-full overflow-auto rounded-md border-2 border-slate-900 dark:border-slate-500 dark:p-[1px]">
           <table className="w-full ">
             <TableHeader
@@ -66,7 +96,7 @@ const InternalStudent = () => {
               ]}
             />
             <tbody className="text-left">
-              {internal?.map((paper, index) => (
+              {filteredInternal.map((paper, index) => (
                 <tr
                   key={index}
                   className={
6 days trial remained
`,`Summarise the following diff file:\n\n${diff}`,
    ]);
    return response.response.text();
}
console.log(await aiSummariseCommit(
    `diff --git a/src/Components/Forms/TimeScheduleForm.js b/src/Components/Forms/TimeScheduleForm.js
index 0540175..0f763db 100644
--- a/src/Components/Forms/TimeScheduleForm.js
+++ b/src/Components/Forms/TimeScheduleForm.js
@@ -5,7 +5,7 @@ import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
 import { toast } from "react-toastify";
 import { TableHeader } from "../Table";
 import Loading from "../Layouts/Loading";
-import ErrorStrip from "../ErrorStrip";
+// import ErrorStrip from "../ErrorStrip";
 import { dummyUsers } from "../../data/users";
 import { dummyPapers } from "../../data/papers";
 import { dummyTimeSchedule } from "../../data/timeSchedule";
@@ -20,8 +20,8 @@ const TimeScheduleForm = () => {
   
   const [timeSchedule, setTimeSchedule] = useState({});
   const [disabled, setDisabled] = useState(true);
-  const [id, setId] = useState("");
-  const [error, setError] = useState("");
+  // const [id, setId] = useState("");
+  // const [error, setError] = useState("");
 
   // updating attendance state on "onChange" event.
   const handleFormChange = (e) => {
@@ -47,7 +47,7 @@ const TimeScheduleForm = () => {
         // Use dummy data for development/testing
         setDisabled(false);
         setTimeSchedule(dummyTimeSchedule);
-        setId("dummy-schedule-id");
+        // setId("dummy-schedule-id");
         return;
       }
 
@@ -209,7 +209,7 @@ const TimeScheduleForm = () => {
           </button>
         )}
       </form>
-      {error ? <ErrorStrip error={error} /> : ""}
+      {/* {error ? <ErrorStrip error={error} /> : ""} */}
     </main>
   );
 };
diff --git a/src/Components/Queries/InternalStudent.js b/src/Components/Queries/InternalStudent.js
index 21e2332..6da44da 100644
--- a/src/Components/Queries/InternalStudent.js
+++ b/src/Components/Queries/InternalStudent.js
@@ -18,24 +18,35 @@ const InternalStudent = () => {
   
   const [internal, setInternal] = React.useState([]);
   const [error, setError] = React.useState("");
+  const [selectedPaper, setSelectedPaper] = React.useState("");
+  const [filteredInternal, setFilteredInternal] = React.useState([]);
 
   React.useEffect(() => {
     const fetchInternal = async () => {
       if (useDummyData) {
         // Use dummy data for development/testing
-        console.log("Loading dummy internal marks data");
         setInternal(dummyInternalMarks);
         toast.success("Dummy internal marks data loaded!");
         return;
       }
-
-      // Original API call logic would go here when useDummyData is false
       setInternal([]);
       setError({ message: "API calls disabled - using dummy data only" });
     };
     fetchInternal();
   }, [user, useDummyData]);
 
+  // Filter internal marks when Fetch is clicked
+  const handleFetch = (e) => {
+    e.preventDefault();
+    if (!selectedPaper) {
+      setFilteredInternal([]);
+      return;
+    }
+    setFilteredInternal(
+      internal.filter((item) => item.paper.paper === selectedPaper)
+    );
+  };
+
   return (
     <main className="internal">
       <div className="flex items-center gap-4 mb-4">
@@ -50,8 +61,27 @@ const InternalStudent = () => {
       <h2 className="mb-2 mt-3 whitespace-break-spaces text-4xl font-bold text-violet-950 underline decoration-inherit decoration-2 underline-offset-4 dark:mt-0 dark:text-slate-400 md:text-6xl">
         Internal Mark
       </h2>
+      <form className="flex gap-4 mb-6" onSubmit={handleFetch}>
+        <select
+          className="rounded p-2 border border-violet-400"
+          value={selectedPaper}
+          onChange={e => setSelectedPaper(e.target.value)}
+          required
+        >
+          <option value="" disabled>Select Paper</option>
+          {internal.map((item, idx) => (
+            <option key={idx} value={item.paper.paper}>{item.paper.paper}</option>
+          ))}
+        </select>
+        <button
+          type="submit"
+          className="px-6 py-2 rounded bg-violet-700 text-white font-semibold hover:bg-violet-900"
+        >
+          Fetch
+        </button>
+      </form>
       <div>{error ? <ErrorStrip error={error} /> : ""}</div>
-      {internal.length ? (
+      {filteredInternal.length ? (
         <section className="my-4 w-full overflow-auto rounded-md border-2 border-slate-900 dark:border-slate-500 dark:p-[1px]">
           <table className="w-full ">
             <TableHeader
@@ -66,7 +96,7 @@ const InternalStudent = () => {
               ]}
             />
             <tbody className="text-left">
-              {internal?.map((paper, index) => (
+              {filteredInternal.map((paper, index) => (
                 <tr
                   key={index}
                   className={
6 days trial remained
`
));

export async function summariseCode(doc: Document) {
  console.log("getting summary for",doc.metadata.source);
  try {
    const code = doc.pageContent.slice(0,10000);
    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file .
      
      Here is the code: 
  ---
      ${code}
  ---
     Give a summary no more than 100 words of the code above
  `,
    ]);
    return response.response.text();
  } catch (error) {
    return ""
  }
}
export async function generateEmbedding(summary:string){
  const model = genAI.getGenerativeModel({
    model:"text-embedding-004"
  })
  const result = await model.embedContent(summary)
  const embedding = result.embedding
  return embedding.values
}
