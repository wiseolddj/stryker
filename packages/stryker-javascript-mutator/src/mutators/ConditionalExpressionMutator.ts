import * as types from '@babel/types';
import NodeMutator from './NodeMutator';
import NodeGenerator from '../helpers/NodeGenerator';
import { NodeWithParent } from '../helpers/ParentNode';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class ConditionalExpressionMutator implements NodeMutator {
  private readonly validOperators: string[] = [
    '!=',
    '!==',
    '&&',
    '<',
    '<=',
    '==',
    '===',
    '>',
    '>=',
    '||',
  ];

  public name = 'ConditionalExpression';

  constructor() {}

  private hasValidParent(node: NodeWithParent): boolean {
    return (
      !node.parent ||
      !(
        types.isForStatement(node.parent) ||
        types.isWhileStatement(node.parent) ||
        types.isIfStatement(node.parent) ||
        types.isDoWhileStatement(node.parent)
      )
    );
  }

  private isValidOperator(operator: string): boolean {
    return this.validOperators.indexOf(operator) !== -1;
  }

  public mutate(node: types.Node): types.Node[] | void {
    if (
      (types.isBinaryExpression(node) || types.isLogicalExpression(node)) &&
      this.hasValidParent(node) &&
      this.isValidOperator(node.operator)
    ) {
      return [
        NodeGenerator.createBooleanLiteralNode(node, false),
        NodeGenerator.createBooleanLiteralNode(node, true),
      ];
    }
  }
}
