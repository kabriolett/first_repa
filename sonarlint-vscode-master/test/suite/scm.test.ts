/* --------------------------------------------------------------------------------------------
 * SonarLint for VisualStudio Code
 * Copyright (C) 2017-2023 SonarSource SA
 * sonarlint@sonarsource.com
 * Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { expect } from 'chai';
import { getSubmoduleRepoPath, notIgnoredFilesFromSubmodules, parseIgnoreCheck } from '../../src/scm/scm';
import * as vscode from 'vscode';


suite('SCM test suite', async () => {

  test('should parse git output', () => {
    const gitOutput = '.git/info/exclude 7 .DS_Store /Users/kirill.knize/PycharmProjects/pythonProject/.DS_Store /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/.gitignore /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/inspectionProfiles/profiles_settings.xml /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/misc.xml /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/modules.xml /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/pythonProject.iml /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/sonarlint/issuestore/a/5/a5cc2925ca8258af241be7e5b0381edf30266302 /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/sonarlint/issuestore/e/7/e7502d31339d538f6a21c6735a89d2a8da61b81d /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/sonarlint/issuestore/index.pb /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/sonarlint/securityhotspotstore/index.pb /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/vcs.xml /Users/kirill.knize/.gitignore_global 13 .idea/ /Users/kirill.knize/PycharmProjects/pythonProject/.idea/workspace.xml /Users/kirill.knize/.gitignore_global 4 .vscode/ /Users/kirill.knize/PycharmProjects/pythonProject/.vscode/settings.json .gitignore 2 Servlet.java /Users/kirill.knize/PycharmProjects/pythonProject/my-folder/Servlet.java .gitignore 1 my.py /Users/kirill.knize/PycharmProjects/pythonProject/my.py ';

    const strings = parseIgnoreCheck(gitOutput);

    expect(strings.size).to.equal(15);
  });

  test('should get not ignored files from submodules', async () => {
    let testSubmodulePath_1 = 'test/submodule_1';
    let testSubmodulePath_2 = 'test/submodule_2';
    const submodulesPaths = [testSubmodulePath_1, testSubmodulePath_2];
    const repoFsPath = '/home/repo';
    const submoduleFullPath_1 = getSubmoduleRepoPath(repoFsPath, submodulesPaths[0]);
    const submoduleFullPath_2 = getSubmoduleRepoPath(repoFsPath, submodulesPaths[1]);
    const ignoredFileSubmodule_1 = vscode.Uri.parse(submoduleFullPath_1 + '/ignoredFile');
    const ignoredFileSubmodule_2 = vscode.Uri.parse(submoduleFullPath_2 + '/ignoredFile');
    const notIgnoredFileSubmodule_1 = vscode.Uri.parse(submoduleFullPath_1 + '/notIgnoredFile');
    const notIgnoredFileSubmodule_2 = vscode.Uri.parse(submoduleFullPath_2 + '/notIgnoredFile');

    const filesInsideSubmodules = [ignoredFileSubmodule_1, notIgnoredFileSubmodule_1, ignoredFileSubmodule_2, notIgnoredFileSubmodule_2];
    const notIgnoredFiles = await notIgnoredFilesFromSubmodules(submodulesPaths, filesInsideSubmodules, repoFsPath, mockScmCheck, '');

    expect(notIgnoredFiles.length).to.equal(2);
    expect(notIgnoredFiles[0].path).to.equal(notIgnoredFileSubmodule_1.path);
    expect(notIgnoredFiles[1].path).to.equal(notIgnoredFileSubmodule_2.path);
  });

  async function mockScmCheck(gitPath: string, gitArgs: string[], workspaceFolderPath: string,
                              fileUris: vscode.Uri[]) {
    let notIgnoredFiles = fileUris
      .filter(fileUri => fileUri.path.includes(workspaceFolderPath) && fileUri.fsPath.includes('notIgnoredFile'));
    return Promise.resolve(notIgnoredFiles);
  }
});
