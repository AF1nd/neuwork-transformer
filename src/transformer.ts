import * as ts from "typescript";

export interface TransformerConfig {
	_: void;
}

export class TransformContext {
	public factory: ts.NodeFactory;

	constructor(
		public program: ts.Program,
		public context: ts.TransformationContext,
		public config: TransformerConfig,
	) {
		this.factory = context.factory;
	}

	transform<T extends ts.Node>(node: T): T {
		return ts.visitEachChild(node, (node) => visitNode(this, node), this.context);
	}
}

function visitNode(context: TransformContext, node: ts.Node): ts.Node | ts.Node[] {
	if (ts.isClassDeclaration(node)) {
		const decorators = ts.getDecorators(node);

		let needContinue = false;

		decorators?.forEach((decorator) => {
			const identifier = decorator.expression as ts.Identifier;

			if (identifier.escapedText === "Provider" || identifier.escapedText === "Service") {
				needContinue = true;
			}
		});

		if (needContinue) {
			const members = Array.from(node.members);
			const injections: ts.StringLiteral[] = [];

			node.members.forEach((member) => {
				if (ts.isPropertyDeclaration(member)) {
					const decorators = ts.getDecorators(member);
					decorators?.forEach((decorator) => {
						const identifier = decorator.expression as ts.Identifier;

						if (identifier.escapedText === "Inject") {
							const name = member.name as ts.Identifier;

							injections.push(
								ts.factory.createStringLiteral(
									`${name.escapedText.toString()}#${member.type?.getFullText().trim()}`,
								),
							);
						}
					});
				}
			});

			members.push(
				ts.factory.createPropertyDeclaration(
					undefined,
					ts.factory.createIdentifier("injections"),
					undefined,
					ts.factory.createTypeReferenceNode("string[]"),
					ts.factory.createArrayLiteralExpression(injections),
				),
			);

			return ts.factory.updateClassDeclaration(
				node,
				node.modifiers,
				node.name,
				node.typeParameters,
				node.heritageClauses,
				members,
			);
		}
	}

	return context.transform(node);
}
