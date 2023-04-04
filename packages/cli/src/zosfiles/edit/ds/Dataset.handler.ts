/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import { AbstractSession, IHandlerParameters, ImperativeError, ITaskWithStatus, TaskStage, TextUtils } from "@zowe/imperative";
import { Download, IZosFilesResponse } from "@zowe/zos-files-for-zowe-sdk";
import { tmpdir } from "os";
import { ZosFilesBaseHandler } from "../../ZosFilesBase.handler";
import { EditUtilities, Prompt } from "../Edit.utils";

/**
 * Handler to edit a data set's content
 * @export
 */
export default class DatasetHandler extends ZosFilesBaseHandler {
    public async processWithSession(commandParameters: IHandlerParameters, session: AbstractSession): Promise<IZosFilesResponse> {
        // Setup
        const Utils = EditUtilities;
        let lfFileResp : IZosFilesResponse;
        const lfDir = await Utils.buildTmpDir(commandParameters);

        // Use or override stash (either way need to retrieve etag)
        const stash: boolean = await Utils.checkForStash(lfDir);
        let overrideStash: boolean = false;

        if (stash) {
            overrideStash = await Utils.promptUser(Prompt.useStash);
        }
        try{
            const task: ITaskWithStatus = {
                percentComplete: 10,
                statusMessage: "Finding mainframe data set",
                stageName: TaskStage.IN_PROGRESS
            };
            commandParameters.response.progress.startBar({task});

            if (overrideStash || !stash) {
                lfFileResp = await Download.dataSet(session, commandParameters.arguments.dataSetName, {returnEtag: true, file: lfDir});
            }else{
                // Download just to get etag. Don't overwrite prexisting file (stash) during process // etag = lfFileResp.apiResponse.etag
                lfFileResp = await Download.dataSet(session, commandParameters.arguments.dataSetName,
                    {returnEtag: true, file: tmpdir()+'toDelete'});
                Utils.destroyTempFile((tmpdir()+'toDelete'));
            }
            task.percentComplete = 70;
            task.stageName = TaskStage.COMPLETE;
        }catch(error){
            throw new ImperativeError({
                msg: TextUtils.chalk.red(`File not found on mainframe. Command terminate`),
                causeErrors: error
            });
        }

        // Edit local copy of mf file
        await Utils.makeEdits(session, commandParameters, lfDir);

        // Once done editing, user will provide terminal input. Upload local file with saved etag
        let uploaded = await Utils.uploadEdits(session, commandParameters, lfDir, lfFileResp);
        while (!uploaded) {
            uploaded = await Utils.uploadEdits(session, commandParameters, lfDir, lfFileResp);
        }

        return {
            success: true,
            commandResponse: TextUtils.chalk.green(
                "Successfully uploaded edited file to mainframe"
            ),
            apiResponse: {}//return IZosFilesResponse here and pertinent file deets
        };
    }
}