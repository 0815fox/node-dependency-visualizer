
function treeWalk(name, node, stopTreewalkPrefix, showUnprefixedDependencies, depVersions) {
	let result = "";
	const version = node.version;
	const nodeName = `${name}\\n${version}`;
	if (depVersions !== undefined && version !== undefined) {
		const duplicates = depVersions.get(name);
		if (duplicates !== undefined) {
			if (duplicates.has(version) === false) duplicates.add(version);
		} else {
			const duplicates = new Set();
			duplicates.add(version);
			depVersions.set(name, duplicates);
		}
	}
	for (const depName in node.dependencies) {
		const dependency = node.dependencies[depName];
		const depNodeName = `${depName}\\n${dependency.version}`;
		if (stopTreewalkPrefix === undefined || depName.startsWith(stopTreewalkPrefix)) {
			result += `  "${nodeName}" -> "${depNodeName}"\n`;
			result += treeWalk(depName, dependency, stopTreewalkPrefix, showUnprefixedDependencies, depVersions);
		} else if (showUnprefixedDependencies) {
			result += `  "${nodeName}" -> "${depNodeName}"\n`;
		}
	}
	return result;
}

module.exports = function(node, stopTreewalkPrefix, showUnprefixedDependencies, highlightConflictingVersions) {
	const depVersions = highlightConflictingVersions === true ? new Map() : undefined;
	const data = treeWalk(node.name, node, stopTreewalkPrefix, showUnprefixedDependencies, depVersions);
	let conflicts = "";
	if (highlightConflictingVersions) {
		for (const [pkgName, versions] of depVersions) {
			if (versions.size > 1) {
				conflicts += `  subgraph "cluster_${pkgName}" {
    node[shape=rectangle,style=filled,fillcolor=white]
    edge[style=invis];
    color=red;
`;
				const versionsArray = Array.from(versions);
				while (versionsArray.length > 0) {
					const version = versionsArray.pop();
					for (let i = 0; i < versionsArray.length; i++) {
						const otherVersion = versionsArray[i];
						conflicts += `    "${pkgName}\\n${version}" -> "${pkgName}\\n${otherVersion}";\n`
					}
				}
				conflicts += "  }\n";
			}
		}
	}
	return `strict digraph DeviceTypeHierarchy {
  rankdir=BT;
  compound=true;
  node[shape=rectangle,style=filled,fillcolor=white]
${conflicts}
${data}
}
`;
};
