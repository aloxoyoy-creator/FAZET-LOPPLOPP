const fs = require('fs');
let c = fs.readFileSync('src/pages/MyMinee.tsx', 'utf-8');

// Replace the state and useEffect
c = c.replace(
  /const \[accessStatus, setAccessStatus\] = useState<'none' \| 'pending' \| 'approved'>\(isFathur \? 'approved' : 'none'\);\n\n  useEffect\(\(\) => \{\n    if \(isFathur\) return;\n    supabase\.from\('app_config'\)\.select\('value'\)\.eq\('key', 'myminee_access_mazet'\)\.single\(\)\.then\(\(\{data\}\) => \{\n      if \(data\?\.value\?\.status\) setAccessStatus\(data\.value\.status\);\n    \}\);\n  \}, \[isFathur\]\);/,
  `const [accessStatus, setAccessStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [mazetRequestStatus, setMazetRequestStatus] = useState<'none' | 'pending' | 'approved'>('none');

  useEffect(() => {
    supabase.from('app_config').select('value').eq('key', 'myminee_access_mazet').single().then(({data}) => {
      if (data?.value?.status) {
        setMazetRequestStatus(data.value.status);
        if (!isFathur) setAccessStatus(data.value.status);
      }
    });
  }, [isFathur]);`
);

// Replace the banner condition
c = c.replace(
  /\{isFathur && accessStatus === 'pending' && \(/,
  `{isFathur && mazetRequestStatus === 'pending' && (`
);

// Replace the setAccessStatus in handleApproveAccess
c = c.replace(
  /setAccessStatus\('approved'\);\n    \} catch \(e\) \{\}/,
  `setMazetRequestStatus('approved');\n    } catch (e) {}`
);

fs.writeFileSync('src/pages/MyMinee.tsx', c);
