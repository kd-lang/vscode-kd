import * as vscode from 'vscode';
import { Range, StatusBarItem, TextEdit, OutputChannel, EndOfLine } from 'vscode';
import { execCmd } from './kdUtil';

export class KdFormatProvider implements vscode.DocumentFormattingEditProvider {
    private _channel: OutputChannel;

    constructor(logChannel: OutputChannel) {
        this._channel = logChannel;
    }

    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options?: vscode.FormattingOptions,
        token?: vscode.CancellationToken,
    ): Thenable<TextEdit[]> {
        const logger = this._channel;
        return kdFormat(document)
            .then(({ stdout }) => {
                logger.clear();
                const lastLineId = document.lineCount - 1;
                const wholeDocument = new vscode.Range(
                    0,
                    0,
                    lastLineId,
                    document.lineAt(lastLineId).text.length,
                );
                return [new TextEdit(wholeDocument, stdout),];
            })
            .catch((reason) => {
                let config = vscode.workspace.getConfiguration('kd');

                logger.clear();
                logger.appendLine(reason.toString().replace('<stdin>', document.fileName));
                if (config.get<boolean>("revealOutputChannelOnFormattingError")) {
                    logger.show(true)
                }
                return null;
            });
    }
}

// Same as full document formatter for now
export class KdRangeFormatProvider implements vscode.DocumentRangeFormattingEditProvider {
    private _channel: OutputChannel;
    constructor(logChannel: OutputChannel) {
        this._channel = logChannel;
    }

    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options?: vscode.FormattingOptions,
        token?: vscode.CancellationToken,
    ): Thenable<TextEdit[]> {
        const logger = this._channel;
        return kdFormat(document)
            .then(({ stdout }) => {
                logger.clear();
                const lastLineId = document.lineCount - 1;
                const wholeDocument = new vscode.Range(
                    0,
                    0,
                    lastLineId,
                    document.lineAt(lastLineId).text.length,
                );
                return [new TextEdit(wholeDocument, stdout),];
            })
            .catch((reason) => {
                const config = vscode.workspace.getConfiguration('kd');

                logger.clear();
                logger.appendLine(reason.toString().replace('<stdin>', document.fileName));
                if (config.get<boolean>("revealOutputChannelOnFormattingError")) {
                    logger.show(true)
                }
                return null;
            });
    }
}

function kdFormat(document: vscode.TextDocument) {
    const config = vscode.workspace.getConfiguration('kd');
    const kdPath = config.get<string>('kdPath') || 'kd';

    const options = {
        cmdArguments: ['fmt', '--stdin'],
        notFoundText: 'Could not find kd. Please add kd to your PATH or specify a custom path to the kd binary in your settings.',
    };
    const format = execCmd(kdPath, options);

    format.stdin.write(document.getText());
    format.stdin.end();

    return format;
}
