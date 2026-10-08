const fs=require('fs'); const replaceInFile = (file, search, rep) => { let c=fs.readFileSync(file,'utf-8'); fs.writeFileSync(file, c.replace(search, rep)); };
replaceInFile('src/components/layout/AppShell.tsx', /import \{ GROUPS, type NavGroup \} from '\.\/Sidebar';/, \import { getGroups, type NavGroup } from './Sidebar';\);
replaceInFile('src/components/layout/AppShell.tsx', /const groups = GROUPS;/, \const { workspaceId } = useWorkspace();\n  const groups = getGroups(workspaceId);\);
replaceInFile('src/components/layout/AppShell.tsx', /export default function AppShell\(\) \{/, \import { useWorkspace } from '../../context/WorkspaceContext';\nexport default function AppShell() {\);

replaceInFile('src/pages/Dashboard.tsx', /import \{ GROUPS \} from '\.\.\/components\/layout\/Sidebar';/, \import { getGroups } from '../components/layout/Sidebar';\);
replaceInFile('src/pages/Dashboard.tsx', /const groups = GROUPS;/, \const groups = getGroups(workspaceId);\);

replaceInFile('src/pages/admin/AdminHub.tsx', /import \{ GROUPS \} from '\.\.\/\.\.\/components\/layout\/Sidebar';/, \import { getGroups } from '../../components/layout/Sidebar';\);
replaceInFile('src/pages/admin/AdminHub.tsx', /const adminGroup = GROUPS\.find/, \const { workspaceId } = useWorkspace();\n  const adminGroup = getGroups(workspaceId).find\);

replaceInFile('src/components/widgets/CurrentSubjectAlert.tsx', /import \{ GROUPS \} from '\.\.\/layout\/Sidebar';/, \import { getGroups } from '../layout/Sidebar';\);
replaceInFile('src/components/widgets/CurrentSubjectAlert.tsx', /const items = GROUPS\.flatMap/, \const { workspaceId } = useWorkspace();\n  const items = getGroups(workspaceId).flatMap\);

