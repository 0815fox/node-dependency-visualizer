
function treeWalk(name, node, stopTreewalkPrefix, showUnprefixedDependencies) {
	let result = "";
	const depVersions = new Map();
	const version = node.version;
	const lastDepVersion = depVersions.get(name);
	const nodeName = `${name}\\n${version}`;
	if (lastDepVersion !== undefined && lastDepVersion !== version) {
		const lastDepVersionNodeName = `${name}\\n${lastDepVersion}`;
		result += `  "${nodeName}"[fillcolor=red]\n`;
		result += `  "${lastDepVersionNodeName}"[fillcolor=red]\n`;
		result += `"${lastDepVersionNodeName}" -> "${nodeName}"[color=red arrowhead=none]`;
	}
	if (version !== undefined) depVersions.set(name, version);
	for (const depName in node.dependencies) {
		const dependency = node.dependencies[depName];
		const depNodeName = `${depName}\\n${dependency.version}`;
		if (stopTreewalkPrefix === undefined || depName.startsWith(stopTreewalkPrefix)) {
			result += `  "${nodeName}" -> "${depNodeName}"\n`;
			result += treeWalk(depName, dependency);
		} else if (showUnprefixedDependencies) {
			result += `  "${nodeName}" -> "${depNodeName}"\n`;
		}
	}
	return result;
}

module.exports = treeWalk;
