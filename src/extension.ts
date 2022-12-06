'use strict';
import * as vscode from 'vscode';
import KdCompilerProvider from './kdCompilerProvider';
import { kdBuild } from './kdBuild';
import { KdFormatProvider, KdRangeFormatProvider } from './kdFormat';

const KD_MODE: vscode.DocumentFilter = { language: 'kd', scheme: 'file' };

export let buildDiagnosticCollection: vscode.DiagnosticCollection;
export const logChannel = vscode.window.createOutputChannel('kd');
export const kdFormatStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

export function activate(context: vscode.ExtensionContext) {
    let compiler = new KdCompilerProvider();
    compiler.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('kd', compiler);

    context.subscriptions.push(logChannel);
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            KD_MODE,
            new KdFormatProvider(logChannel),
        ),
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentRangeFormattingEditProvider(
            KD_MODE,
            new KdRangeFormatProvider(logChannel),
        ),
    );

    buildDiagnosticCollection = vscode.languages.createDiagnosticCollection('kd');
    context.subscriptions.push(buildDiagnosticCollection);

    // Commands
    context.subscriptions.push(vscode.commands.registerCommand('kd.build.workspace', () => kdBuild()));
    // @ts-ignore
    context.subscriptions.push(vscode.commands.registerCommand('kd.format.file', () => console.log('test')));
}

export function deactivate() {
}
