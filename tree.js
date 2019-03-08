#!/usr/bin/env node

const commandLineArgs = require('command-line-args');

const optionDefinitions = [
	{ name: 'stop-treewalk-prefix', alias: 'p', type: String },
	{ name: 'show-unprefixed-dependencies', alias: 'u', type: Boolean },
];

const options = commandLineArgs(optionDefinitions);

const { spawn } = require( 'child_process' );
const ls = spawn( 'npm', [ 'ls', '--json' ] );

function emit(data) {
	process.stdout.write(data);
}

const depVersions = new Map();

function treeWalk(name, node) {
	const version = node.version;
	const lastDepVersion = depVersions.get(name);
	const nodeName = `${name}\\n${version}`;
	if (lastDepVersion !== undefined && lastDepVersion !== version) {
		const lastDepVersionNodeName = `${name}\\n${lastDepVersion}`;
		emit(`  "${nodeName}"[fillcolor=red]\n`);
		emit(`  "${lastDepVersionNodeName}"[fillcolor=red]\n`);
		emit(`"${lastDepVersionNodeName}" -> "${nodeName}"[color=red arrowhead=none]`);
	}
	if (version !== undefined) depVersions.set(name, version);
	for (const depName in node.dependencies) {
		const dependency = node.dependencies[depName];
		const depNodeName = `${depName}\\n${dependency.version}`;
		if (options["stop-treewalk-prefix"] === undefined || depName.startsWith(options["stop-treewalk-prefix"])) {
			emit(`  "${nodeName}" -> "${depNodeName}"\n`);
			treeWalk(depName, dependency);
		} else if (options["show-unprefixed-dependencies"]) {
			emit(`  "${nodeName}" -> "${depNodeName}"\n`);
		}
	}
}

let data = "";

ls.stdout.on("data", (chunk) => {
	data += chunk;
});

ls.stdout.on("close", () => {
	const tree = JSON.parse(data);
	process.stdout.write(`strict digraph DeviceTypeHierarchy_Oblamatikproducts {
  rankdir=BT;
  compound=true;
  node[shape=record,style=filled,fillcolor=white]
`);
	treeWalk(tree.name, tree);
	process.stdout.write("}\n");
});
