import type { Challenge, CodeLanguage, CodeTest, CodingConfig, SkillId } from '../domain'

const langs: CodeLanguage[] = ['typescript', 'javascript', 'python']
const six = (...items: [string, string, string, string, string, string]) => items
const rubric = (id: string, label: string, description: string, skills: SkillId[], keywords: string[]) => ({ id, label, description, skills, keywords })
const coding = (functionName: string, starterCode: CodingConfig['starterCode'], tests: CodeTest[], timeLimitMs = 2500): CodingConfig => ({ functionName, languages: langs, starterCode, tests, timeLimitMs })

export const learningChallenges: Challenge[] = [
  {
    id: 'request-pipeline-structures', title: 'Refactor a Request Pipeline for Scale', type: 'coding', skills: ['programming', 'dsa', 'backend'],
    scenario: 'A request service receives a large mixed stream. Only pending requests should be grouped by employee, and the same request ID must never be emitted twice.',
    prompt: 'Implement groupPending(requests). Return employee → unique pending request IDs. Optimize for a large input rather than repeatedly scanning accumulated arrays.',
    evidence: 'Tests practical hash-based lookup/grouping and ability to connect implementation choices to complexity.',
    hints: six('Which repeated lookup becomes expensive if you scan an array every time?', 'Separate “seen ID?” from “group by employee.”', 'A Set solves membership; a map/dictionary solves grouping.', 'Loop once: skip non-pending or seen; record ID; append under employee.', 'Aim for average O(n) time and O(n) auxiliary space.', 'Use a Set of seen IDs plus an employee-keyed map/dictionary, processing each input once.'),
    coding: coding('groupPending', {
      typescript: `type Req = { id: string; employee: string; status: string }\nfunction groupPending(requests: Req[]): Record<string,string[]> {\n  return {}\n}`,
      javascript: `function groupPending(requests) {\n  return {}\n}`,
      python: `def groupPending(requests):\n    return {}`,
    }, [
      { name: 'groups and deduplicates', args: [[{id:'r1',employee:'a',status:'pending'},{id:'r2',employee:'b',status:'pending'},{id:'r1',employee:'a',status:'pending'},{id:'r3',employee:'a',status:'pending'},{id:'x',employee:'b',status:'approved'}]], expected: {a:['r1','r3'],b:['r2']} },
      { name: 'empty input', args: [[]], expected: {}, hidden: true },
    ])
  },
  {
    id: 'oop-agent-boundaries', title: 'Refactor a Brittle Automation Service', type: 'free-response', skills: ['programming','backend'],
    scenario: 'One 900-line class logs in, fetches work, parses data, decides actions, automates a browser, retries failures, and writes audit records. Small changes keep breaking unrelated behavior.',
    prompt: 'Propose a refactor that improves changeability and testability. Explain responsibilities, interfaces/dependencies, and where composition helps. Avoid abstracting merely for style.',
    evidence: 'Tests OOP vocabulary through a practical boundary/refactoring problem rather than memorized definitions.',
    rubric: [
      rubric('responsibility','Separate responsibilities','Identifies cohesive units rather than one god class.',['programming','backend'],['responsibility','separate','service','class','module']),
      rubric('dependency','Dependency boundaries','Makes browser/data/audit dependencies replaceable/testable.',['programming'],['interface','dependency','inject','mock','adapter','port']),
      rubric('composition','Composition over fragile inheritance','Uses composition to assemble behavior.',['programming'],['composition','compose','inheritance']),
      rubric('testing','Testability','Explains unit/integration seams.',['programming','backend'],['test','unit','integration','fake','mock']),
    ],
    hints: six('Start by naming distinct reasons this class might change.', 'Which dependencies make isolated testing difficult?', 'Consider orchestration + adapters/services rather than a single inheritance hierarchy.', 'Sketch interfaces for work source, executor, retry policy, and audit sink; compose them in an orchestrator.', 'Explain what remains concrete and what deserves an interface based on volatility/testing needs.', 'A strong answer separates orchestration from data access, browser execution, retry policy and audit persistence; injects replaceable dependencies; uses composition; and defines unit/integration seams without creating interfaces for every trivial helper.')
  },
  {
    id: 'api-contract', title: 'Design an Approval Service API Contract', type: 'free-response', skills: ['backend','system-design'],
    scenario: 'A client needs to list pending requests and submit approve/reject actions. Network retries are expected and callers have different permissions.',
    prompt: 'Design the HTTP API contract: resources/endpoints, request/response shapes, status codes, validation, authorization boundary, and how a retried mutation avoids duplicate side effects.',
    evidence: 'Tests practical REST/HTTP vocabulary, API semantics, authorization and idempotency.',
    rubric: [
      rubric('resource','Resource-oriented contract','Defines clear resources and verbs/status codes.',['backend'],['GET','POST','PATCH','status','resource','/requests']),
      rubric('validation','Validation and errors','Defines validation/error shape and useful status codes.',['backend'],['400','422','validation','error','409']),
      rubric('authz','Authorization','Separates authenticated identity from permission to act.',['backend','system-design'],['authorization','permission','role','403','identity']),
      rubric('idempotency','Idempotent mutation','Handles client retry safely.',['backend','system-design'],['idempotency','idempotent','key','request id','retry']),
    ],
    hints: six('Think about read operations separately from side-effecting commands.', 'What should a client be able to retry safely after a timeout?', 'Include authn/authz, validation, status codes and a stable idempotency key.', 'Sketch GET /requests?status=pending and a mutation endpoint with an idempotency key and explicit result.', 'Specify conflict/not-found/forbidden/validation behavior so clients can recover deterministically.', 'A strong contract has resource-oriented reads, explicit approve/reject mutation semantics, validated schemas, authentication + per-request authorization, stable errors/status codes, and idempotency-key handling for retried side effects.')
  },
  {
    id: 'postgres-plan', title: 'Diagnose a Slow PostgreSQL Workload', type: 'multiple-choice', skills: ['databases','backend'],
    scenario: 'A query over 40M rows filters `assignee_id = ? AND status = pending`, orders by created_at DESC, and limits 100. Latency recently jumped from 80ms to several seconds.',
    prompt: 'What is the strongest first move before changing infrastructure?',
    options: ['Add more application replicas','Run EXPLAIN (ANALYZE, BUFFERS), inspect row estimates/scans and existing indexes','Copy all rows to Redis','Partition the table immediately'], correctOption: 1,
    evidence: 'Tests evidence-first database diagnosis and query/index vocabulary.',
    hints: six('Prove where the database spends time before prescribing scale.', 'PostgreSQL can show the actual execution plan.', 'Look for sequential scans, misestimates, sort cost and index usage.', 'Use EXPLAIN ANALYZE/BUFFERS and compare with current indexes.', 'Then evaluate a composite/partial index matching filter/order if evidence supports it.', 'The correct first move is to inspect the real execution plan and indexes; optimize based on observed scan/sort/cardinality behavior.')
  },
  {
    id: 'transaction-race', title: 'Stop a Duplicate Side-Effect Race', type: 'free-response', skills: ['databases','backend','distributed-systems'],
    scenario: 'Two workers receive the same logical operation within milliseconds. Both check `processed=false`, both call an external side effect, and only afterward mark the row processed.',
    prompt: 'Redesign the flow so concurrency and retries cannot casually produce two business actions. Discuss what the database can guarantee and what remains hard when the external side effect is not transactional with your DB.',
    evidence: 'Tests transactions, uniqueness, idempotency, race conditions and external side-effect reasoning.',
    rubric: [
      rubric('claim','Race-safe claim','Uses atomic claim/unique constraint/conditional update.',['databases','distributed-systems'],['transaction','unique','atomic','compare','lock','insert']),
      rubric('idempotency','Stable operation identity','Uses idempotency key across retries.',['backend','distributed-systems'],['idempotency','idempotent','operation id','request id']),
      rubric('external','External-side-effect limitation','Recognizes DB transaction cannot roll back external system.',['system-design','distributed-systems'],['external','cannot rollback','outbox','reconcile','uncertain']),
      rubric('recovery','Recovery/reconciliation','Handles crash between external action and durable result.',['backend','distributed-systems'],['retry','reconcile','status','unknown','result']),
    ],
    hints: six('A read-then-write check is not atomic. How can only one worker claim an operation?', 'Use the database to make ownership/uniqueness race-safe.', 'Now consider the crash after the external action succeeds but before your DB records success.', 'Separate operation state (pending/in-flight/succeeded/uncertain), stable idempotency identity, and reconciliation.', 'If the external system supports idempotency, propagate the same key; otherwise you need reconciliation and careful uncertainty handling.', 'Use a stable operation key plus atomic DB claim/uniqueness. Persist state transitions. Propagate idempotency to the external system when possible; otherwise explicitly model the unavoidable uncertainty window and reconcile rather than pretending a DB transaction makes the external side effect atomic.')
  },
  {
    id: 'queue-retries', title: 'Build a Retry-Safe Worker with a DLQ', type: 'free-response', skills: ['backend','distributed-systems'],
    scenario: 'A worker consumes jobs that call a flaky downstream dependency. Some failures recover in seconds; malformed jobs will never succeed. A poison message currently loops forever.',
    prompt: 'Design retry, backoff, idempotency and dead-letter behavior. Explain which errors retry, how many times, what is persisted/observed, and how operators recover a DLQ item.',
    evidence: 'Tests asynchronous reliability: retry classification, backoff, idempotency, DLQs and operability.',
    rubric: [
      rubric('classify','Retryable vs permanent','Classifies errors instead of retrying everything.',['backend'],['retryable','permanent','validation','timeout','429','5xx']),
      rubric('backoff','Bounded backoff','Uses exponential backoff/jitter and max attempts.',['distributed-systems'],['backoff','jitter','attempt','limit']),
      rubric('idempotency','Idempotent processing','Retries do not duplicate business action.',['backend','distributed-systems'],['idempotency','dedupe','operation id']),
      rubric('dlq','DLQ and recovery','Stores terminal failure context and supports inspection/replay.',['backend','distributed-systems'],['dead letter','DLQ','replay','alert','reason']),
    ],
    hints: six('Not every failure deserves another attempt.', 'Separate transient dependency failures from invalid/permanent jobs.', 'Add bounded exponential backoff + jitter, and make each logical job idempotent.', 'After max attempts/permanent failure, store enough context in a DLQ and alert/observe it.', 'Define a safe operator replay path that preserves the same logical operation identity.', 'Retry only classified transient failures with bounded exponential backoff/jitter; make processing idempotent; route permanent/exhausted jobs to a DLQ with reason/context/metrics; and provide a controlled replay path that retains the operation identity.')
  },
  {
    id: 'k8s-rollout', title: 'Debug a Kubernetes Rollout Under Traffic', type: 'multiple-choice', skills: ['cloud-production','system-design'],
    scenario: 'During a rolling deploy, error rate spikes. New pods become Ready immediately, but the app needs ~20s to warm caches and establish downstream connections. Old pods terminate quickly while requests are still in flight.',
    prompt: 'Which change most directly addresses the rollout failure described?',
    options: ['Increase log retention','Use a meaningful readiness probe plus graceful shutdown/preStop/termination grace so traffic only reaches ready pods and drains old ones','Switch from HTTP to gRPC','Double Redis memory'], correctOption: 1,
    evidence: 'Tests Kubernetes readiness vs liveness, graceful termination and rollout behavior.',
    hints: six('Which signal tells Kubernetes a pod should receive traffic?', 'Ready-to-run is not the same as process-started.', 'Also think about what happens to in-flight requests when an old pod exits.', 'Use readiness for warm-up and graceful draining for shutdown.', 'Pair probes with appropriate rolling-update capacity if needed.', 'The described failure is directly addressed by truthful readiness plus graceful termination/draining; then validate rollout surge/unavailable settings against capacity.')
  },
  {
    id: 'observability-debug', title: 'Find a Production Failure from Telemetry', type: 'free-response', skills: ['cloud-production','backend','system-design'],
    scenario: 'Users report intermittent 12s requests. Overall CPU is normal. p50 latency is 120ms, p99 is 12s, DB query latency is stable, and a downstream service shows occasional 10s connection waits.',
    prompt: 'Walk through your debugging strategy. State hypotheses, the logs/metrics/traces you would correlate, and what evidence would make you change course. Do not jump directly to a fix.',
    evidence: 'Tests hypothesis-driven production debugging and observability vocabulary.',
    rubric: [
      rubric('tail','Tail-latency focus','Recognizes p99 problem despite healthy averages.',['cloud-production'],['p99','tail','percentile']),
      rubric('correlation','Cross-signal correlation','Correlates request/trace IDs and downstream timing.',['cloud-production','backend'],['trace','request id','span','correlate','downstream']),
      rubric('hypothesis','Hypothesis-driven debugging','Names hypotheses and disconfirming evidence.',['system-design'],['hypothesis','evidence','compare','narrow']),
      rubric('connection','Connection-layer investigation','Investigates pool/DNS/TLS/connect timeout based on clue.',['backend','cloud-production'],['connection','pool','dns','tls','timeout']),
    ],
    hints: six('The average is not the problem—what does p99 tell you?', 'Follow one slow request end-to-end rather than staring at aggregate CPU.', 'Correlate trace spans, connection wait metrics and logs around the same request IDs.', 'Investigate connection establishment/pool saturation/DNS/TLS while checking whether slow requests share a host/zone/version.', 'Define evidence that would falsify the downstream-connection hypothesis before changing production settings.', 'Start with tail-latency traces for slow request IDs, correlate downstream connection spans/logs/metrics, compare slow vs normal requests across host/zone/version, investigate pool/connect/DNS/TLS causes, and only change configuration after the evidence narrows the hypothesis.')
  },
  {
    id: 'ai-tool-guardrails', title: 'Put Guardrails Around an AI Tool Call', type: 'free-response', skills: ['ai-engineering','system-design'],
    scenario: 'An LLM can interpret a user message and call a tool that changes a real enterprise record. A malicious document included in context may contain instructions telling the model to bypass policy.',
    prompt: 'Design the execution boundary. What can the model decide, what must deterministic code validate, when is human confirmation required, and what gets logged?',
    evidence: 'Tests prompt-injection awareness, authorization, schema validation, deterministic policy and auditability.',
    rubric: [
      rubric('untrusted','Treat model/context as untrusted','Does not grant model authority because content says so.',['ai-engineering'],['untrusted','prompt injection','instruction','context']),
      rubric('authz','Deterministic authorization','Authorization happens outside model.',['ai-engineering','system-design'],['authorization','permission','policy','identity']),
      rubric('schema','Tool validation','Validates allowed tool/arguments and business rules.',['ai-engineering'],['schema','validate','allowlist','business rule']),
      rubric('human-audit','Human + audit boundary','Confirms high-risk actions and records evidence/result.',['system-design'],['confirm','human','audit','log','result']),
    ],
    hints: six('The model can propose an action without having authority to execute it.', 'Treat retrieved/user content and model output as untrusted data at the tool boundary.', 'Deterministically check identity, permission, allowed tool, schema and business rules.', 'Require explicit confirmation for high-impact/ambiguous actions, then execute through a narrow tool adapter.', 'Audit the original request, resolved identity, proposed action, policy decision, confirmation, tool result and errors.', 'Let the model interpret/propose; deterministic code authenticates, authorizes, validates schema/business rules and tool allowlists; require human confirmation by risk; execute through a narrow adapter; and write an immutable-enough audit trail. Never let prompt text override policy.')
  },
  {
    id: 'ai-eval-harness', title: 'Build a Small AI Evaluation Harness', type: 'coding', skills: ['ai-engineering','programming'],
    scenario: 'You run a fixed eval set after each prompt/model change. Each result has an id and pass boolean. You need a deterministic summary for CI and failure triage.',
    prompt: 'Implement summarizeEval(results) returning { total, passed, failedIds }. Preserve failed IDs in input order.',
    evidence: 'Tests the deterministic shell around probabilistic systems and basic data transformation fluency.',
    hints: six('The evaluator itself should be boring and deterministic.', 'Count total/passed and collect IDs whose pass flag is false.', 'One linear pass is enough.', 'Initialize counters/list; loop; increment passed or append id.', 'Return exactly total, passed, failedIds in an object/dict.', 'Iterate results once; `passed += 1` for true, otherwise append the id; return `{total: results.length, passed, failedIds}`.'),
    coding: coding('summarizeEval', {
      typescript: `type EvalResult={id:string;pass:boolean}\nfunction summarizeEval(results: EvalResult[]) {\n  return { total: 0, passed: 0, failedIds: [] as string[] }\n}`,
      javascript: `function summarizeEval(results) {\n  return { total: 0, passed: 0, failedIds: [] }\n}`,
      python: `def summarizeEval(results):\n    return {"total": 0, "passed": 0, "failedIds": []}`,
    }, [
      { name:'summarizes mixed results', args:[[{id:'a',pass:true},{id:'b',pass:false},{id:'c',pass:true}]], expected:{total:3,passed:2,failedIds:['b']} },
      { name:'handles empty set', args:[[]], expected:{total:0,passed:0,failedIds:[]}, hidden:true },
    ])
  },
  {
    id: 'fde-discovery', title: 'Run Technical Discovery Before Designing', type: 'free-response', skills: ['fde','technical-leadership','system-design'],
    scenario: 'A customer says: “Approvals across our internal tools waste hours. Build us one place to handle them.” They have not specified systems, identities, volumes, risk or success criteria.',
    prompt: 'Conduct written discovery. Ask the questions that could materially change architecture, prototype scope, security model or rollout. For each category, explain what decision the answer affects.',
    evidence: 'Tests whether the learner can resist premature architecture and turn ambiguity into decision-relevant facts.',
    rubric: [
      rubric('outcome','Business outcome and users','Clarifies actors, baseline pain and measurable outcome.',['fde','technical-leadership'],['user','volume','time','success','metric','workflow']),
      rubric('systems','System constraints','Discovers APIs/UI/SSO/MFA/network/device constraints.',['fde','system-design'],['api','ui','sso','mfa','vpn','device','network']),
      rubric('risk','Security and risk','Clarifies authority, sensitive data, audit/compliance and reversibility.',['fde','system-design'],['security','audit','permission','sensitive','risk','reversible']),
      rubric('rollout','Rollout and ownership','Defines pilot, support owner, fallback and adoption.',['fde','technical-leadership'],['pilot','support','rollout','fallback','adoption','owner']),
    ],
    hints: six('Ask only questions whose answers change a decision.', 'Cover outcome/users, systems/integration, identity/security, reliability/operations, and rollout/adoption.', 'For each question, write the design fork it controls.', 'Example: “Is user-bound SSO required?” determines centralized vs user-context execution.', 'Include success metrics and current baseline so you can prove the deployment helped.', 'A strong discovery maps business outcome/volume, system/API/UI and identity/network constraints, security/audit/reversibility, failure/support ownership, and pilot/adoption metrics directly to architectural and rollout decisions.')
  },
  {
    id: 'fde-no-api', title: 'Prototype an Integration Where No API Exists', type: 'free-response', skills: ['fde','backend','cloud-production','system-design'],
    scenario: 'After discovery, two target systems expose no usable write API. Actions must occur under each employee’s authenticated identity on a managed device. A centralized service can reach internal read endpoints but cannot impersonate users.',
    prompt: 'Propose the smallest defensible prototype architecture. Explain central vs local responsibilities, identity boundary, job delivery, result storage, retries/failure states, observability and how you would pilot it before broad rollout.',
    evidence: 'Tests FDE-style enterprise integration under ugly constraints while requiring production engineering judgment.',
    rubric: [
      rubric('boundary','Central/local execution boundary','Puts user-bound browser action in user context and orchestration centrally.',['fde','system-design'],['local','agent','central','orchestrator','device']),
      rubric('identity','Identity-aware execution','Preserves user identity/authorization rather than shared credentials.',['fde','system-design'],['identity','session','user','credential','authorization']),
      rubric('delivery','Reliable job/result flow','Defines queue/claim/status/idempotency/result.',['backend','cloud-production'],['queue','job','idempotency','status','result','retry']),
      rubric('pilot','Pilot and operability','Defines small pilot, telemetry, fallback/support.',['fde','cloud-production'],['pilot','monitor','metric','fallback','support','rollback']),
    ],
    hints: six('Place execution where the required authenticated identity actually exists.', 'Central coordination does not imply central browser execution.', 'Think central request store/scheduler + authenticated local agent + narrow job protocol.', 'Model job states and idempotency so disconnects/retries do not hide uncertainty.', 'Instrument success/failure/latency and pilot with a small opt-in group plus manual fallback.', 'A defensible prototype centralizes discovery/scheduling/state while a managed local agent performs only authorized user-context actions; uses a narrow authenticated job/result protocol with idempotent states/retries; records audit/telemetry; and pilots with a small cohort, explicit fallback and support ownership.')
  },

  {
    id:'dsa-two-sum', title:'DSA: Hash-Map Lookup Under Pressure', type:'coding', skills:['dsa','programming'],
    scenario:'Given an array of integers and a target, return indices of the two distinct elements whose values sum to the target. Exactly one solution exists.',
    prompt:'Implement twoSum(nums, target) in average O(n) time.', evidence:'Reinforces hash-map lookup and complements practical request dedup/grouping.',
    hints:six('A nested loop works but repeats searching.', 'As you scan, what complement would solve the target?', 'Store value → index for values already seen.', 'For each value, check target-value in the map; if found return indices; otherwise store current.', 'Do the lookup before storing current to avoid reusing the same element.', 'Use a hash map from seen value to index; scan once, check `target - nums[i]`, return prior index + i when present.'),
    coding:coding('twoSum',{typescript:`function twoSum(nums:number[], target:number): number[]{\n  return []\n}`,javascript:`function twoSum(nums, target){\n  return []\n}`,python:`def twoSum(nums, target):\n    return []`},[
      {name:'basic',args:[[2,7,11,15],9],expected:[0,1]},{name:'non-adjacent',args:[[3,2,4],6],expected:[1,2]},{name:'duplicate values',args:[[3,3],6],expected:[0,1],hidden:true}
    ])
  },
  {
    id:'dsa-valid-parentheses', title:'DSA: Stack for Nested Workflows', type:'coding', skills:['dsa','programming'],
    scenario:'Validate whether (), [] and {} brackets in a string are correctly nested and closed.', prompt:'Implement isValidBrackets(s).', evidence:'Builds stack recognition for nested/last-opened-first-closed structures.',
    hints:six('Which unmatched opening bracket matters when you see a closing one?', 'The most recent unmatched opening bracket must close first.', 'That is LIFO: use a stack.', 'Push openings; on close, pop and compare expected pair; stack must end empty.', 'Reject a closing bracket when stack is empty or top does not match.', 'Use a stack plus close→open map; push openings, validate/pop on closings, return stack length === 0.'),
    coding:coding('isValidBrackets',{typescript:`function isValidBrackets(s:string): boolean {\n  return false\n}`,javascript:`function isValidBrackets(s){\n  return false\n}`,python:`def isValidBrackets(s):\n    return False`},[
      {name:'nested valid',args:['([]{})'],expected:true},{name:'wrong nesting',args:['([)]'],expected:false},{name:'unfinished',args:['((('],expected:false,hidden:true},{name:'empty',args:[''],expected:true,hidden:true}
    ])
  },
  {
    id:'dsa-merge-intervals', title:'DSA: Merge Overlapping Windows', type:'coding', skills:['dsa','programming'],
    scenario:'Deployment maintenance windows are intervals [start,end]. Combine overlaps so operators see the minimum disjoint set.', prompt:'Implement mergeIntervals(intervals). Return intervals ordered by start.', evidence:'Reinforces sorting + linear merge and complexity explanation.',
    hints:six('If intervals are unordered, what first step makes overlap decisions local?', 'Sort by start time.', 'After sorting, compare each interval only with the last merged interval.', 'If start <= last end, extend last end; otherwise append a new interval.', 'Overall cost is dominated by sorting: O(n log n).', 'Sort by start; seed output; for each interval merge into the last when overlapping, else append; return output.'),
    coding:coding('mergeIntervals',{typescript:`function mergeIntervals(intervals:number[][]): number[][] {\n  return []\n}`,javascript:`function mergeIntervals(intervals){\n  return []\n}`,python:`def mergeIntervals(intervals):\n    return []`},[
      {name:'merges overlaps',args:[[[1,3],[2,6],[8,10],[15,18]]],expected:[[1,6],[8,10],[15,18]]},{name:'touching overlaps',args:[[[1,4],[4,5]]],expected:[[1,5]]},{name:'empty',args:[[]],expected:[],hidden:true}
    ])
  },
  {
    id:'dsa-top-k', title:'DSA: Prioritize Top-K Jobs', type:'coding', skills:['dsa','programming'],
    scenario:'Return the k most frequent integer job types. Test cases avoid frequency ties so output order is deterministic: highest frequency first.', prompt:'Implement topKFrequent(nums, k).', evidence:'Introduces frequency maps and priority/heap thinking without competitive-programming tricks.',
    hints:six('First transform raw items into value → frequency.', 'You only need k winners, not a fully useful ordering of every occurrence.', 'A heap can keep top k; sorting frequency entries is also a valid simpler baseline.', 'Build frequency map, rank unique values by frequency descending, take k.', 'Explain that full sort is O(m log m); heap can be O(m log k), where m is unique values.', 'Count with a map; sort entries by frequency descending (or use min-heap size k); return first k values.'),
    coding:coding('topKFrequent',{typescript:`function topKFrequent(nums:number[], k:number): number[]{\n  return []\n}`,javascript:`function topKFrequent(nums,k){\n  return []\n}`,python:`def topKFrequent(nums, k):\n    return []`},[
      {name:'top two',args:[[1,1,1,2,2,3],2],expected:[1,2]},{name:'single',args:[[9,9,8],1],expected:[9]},{name:'three unique frequencies',args:[[4,4,4,4,5,5,5,6,6,7],3],expected:[4,5,6],hidden:true}
    ])
  },
  {
    id:'dsa-tree-config', title:'DSA: Traverse Nested Configuration', type:'coding', skills:['dsa','programming'],
    scenario:'A binary configuration tree uses nodes `{value,left,right}`. Return its maximum depth; null has depth 0.', prompt:'Implement maxDepth(root).', evidence:'Builds tree vocabulary and recursive decomposition.',
    hints:six('What is the depth of an empty subtree?', 'A node depth depends on the deeper of its children.', 'This definition naturally recurses.', 'Base null→0; otherwise 1 + max(depth(left), depth(right)).', 'An iterative BFS by levels is also valid; recursion is simplest here.', 'Return 0 for null; otherwise return `1 + max(maxDepth(left), maxDepth(right))`.'),
    coding:coding('maxDepth',{typescript:`type Node={value:number,left?:Node|null,right?:Node|null}\nfunction maxDepth(root:Node|null): number {\n  return 0\n}`,javascript:`function maxDepth(root){\n  return 0\n}`,python:`def maxDepth(root):\n    return 0`},[
      {name:'depth three',args:[{value:1,left:{value:2,left:{value:3}},right:{value:4}}],expected:3},{name:'single',args:[{value:1}],expected:1},{name:'null',args:[null],expected:0,hidden:true}
    ])
  },
  {
    id:'dsa-graph-deps', title:'DSA: Detect Dependency Cycles', type:'coding', skills:['dsa','programming'],
    scenario:'A directed adjacency object maps service → dependencies. Return true when any dependency cycle exists.', prompt:'Implement hasCycle(graph). Nodes can appear only as dependencies and may have no adjacency entry.', evidence:'Builds graph/DFS vocabulary and cycle-detection reasoning.',
    hints:six('A globally visited node is not enough to distinguish a cycle from a shared dependency.', 'You need to know whether a node is on the current DFS path.', 'Track visiting (active path) separately from visited (finished).', 'DFS: if visiting→cycle; if visited→safe; mark visiting, recurse neighbors, move to visited.', 'Run DFS from every node/key/dependency not already finished.', 'Use DFS with two sets/states: `visiting` for current recursion stack and `visited` for completed nodes; encountering `visiting` means a directed cycle.'),
    coding:coding('hasCycle',{typescript:`function hasCycle(graph:Record<string,string[]>): boolean {\n  return false\n}`,javascript:`function hasCycle(graph){\n  return false\n}`,python:`def hasCycle(graph):\n    return False`},[
      {name:'cycle',args:[{a:['b'],b:['c'],c:['a']}],expected:true},{name:'dag',args:[{a:['b','c'],b:['d'],c:['d'],d:[]}],expected:false},{name:'self cycle',args:[{a:['a']}],expected:true,hidden:true}
    ])
  },
  {
    id:'dsa-binary-search', title:'DSA: Binary-Search a Safe Threshold', type:'coding', skills:['dsa','programming'],
    scenario:'Given a sorted array of numeric thresholds, return the first index whose value is greater than or equal to target; return -1 if none.', prompt:'Implement firstAtLeast(values, target) in O(log n).', evidence:'Builds binary search over a monotonic condition and boundary handling.',
    hints:six('The predicate `values[i] >= target` changes from false to true at most once.', 'Binary search for the boundary, not just an exact match.', 'Keep a candidate answer when mid satisfies the predicate, then search left.', 'Use lo/hi; on values[mid] >= target set answer=mid, hi=mid-1; else lo=mid+1.', 'Handle empty input and target above max with -1.', 'Initialize ans=-1; binary search; satisfying mid becomes candidate and moves left, otherwise move right; return ans.'),
    coding:coding('firstAtLeast',{typescript:`function firstAtLeast(values:number[], target:number): number {\n  return -1\n}`,javascript:`function firstAtLeast(values,target){\n  return -1\n}`,python:`def firstAtLeast(values, target):\n    return -1`},[
      {name:'middle boundary',args:[[1,3,5,7],4],expected:2},{name:'exact',args:[[1,3,5,7],5],expected:2},{name:'above all',args:[[1,3],9],expected:-1},{name:'duplicates',args:[[1,2,2,2,5],2],expected:1,hidden:true}
    ])
  },
  {
    id:'dsa-bfs', title:'DSA: BFS Through Service Dependencies', type:'coding', skills:['dsa','programming'],
    scenario:'Return nodes in breadth-first order from `start` in an adjacency object. Visit each node once and honor neighbor list order.', prompt:'Implement bfsOrder(graph, start).', evidence:'Reinforces queues, visited sets and breadth-first traversal.',
    hints:six('Breadth-first means process nodes in the order they are discovered.', 'Which data structure is FIFO?', 'Use a queue plus a visited set to avoid cycles/repeats.', 'Enqueue start; while queue nonempty dequeue, append result, enqueue unseen neighbors.', 'Mark visited when enqueuing, not later, so duplicates do not enter the queue.', 'Initialize queue=[start], seen={start}; repeatedly shift/dequeue, append, enqueue each unseen neighbor and mark it seen; return order.'),
    coding:coding('bfsOrder',{typescript:`function bfsOrder(graph:Record<string,string[]>, start:string): string[]{\n  return []\n}`,javascript:`function bfsOrder(graph,start){\n  return []\n}`,python:`def bfsOrder(graph, start):\n    return []`},[
      {name:'level order',args:[{a:['b','c'],b:['d'],c:['e'],d:[],e:[]},'a'],expected:['a','b','c','d','e']},{name:'cycle visited once',args:[{a:['b'],b:['a','c'],c:[]},'a'],expected:['a','b','c']},{name:'isolated',args:[{},'x'],expected:['x'],hidden:true}
    ])
  }
]

export const learningChallengeIds = new Set(learningChallenges.map((challenge) => challenge.id))
export function getLearningChallenge(id: string) { return learningChallenges.find((challenge) => challenge.id === id) }
