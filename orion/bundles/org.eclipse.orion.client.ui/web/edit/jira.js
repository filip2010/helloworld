/*******************************************************************************
 * @license
 * Copyright (c) 2012, 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define orion window document */
/*jslint browser:true*/

/*
 * Glue code for content.html
 */

define(['i18n!orion/content/nls/messages', 'require', 'orion/bootstrap', 'orion/webui/littlelib', 'orion/status', 'orion/progress', 'orion/commandRegistry', 'orion/fileClient', 'orion/operationsClient',
	        'orion/searchClient', 'orion/globalCommands', 'orion/PageUtil'], 
			function(messages, require, mBootstrap, lib, mStatus, mProgress, mCommandRegistry, mFileClient, mOperationsClient, mSearchClient, 
				mGlobalCommands, PageUtil) {


              var node = lib.node("jira");
              if(node){
				 var flag = true;
                 document.getElementById("jiraButton").onclick = function() {
                 if (flag)
                    node.classList.add("hidden"); 
                 else 
                    node.classList.remove("hidden"); 	 
                   
                   flag = !flag;
                 }; //$NON-NLS-0$
			   
			}
		mBootstrap.startup().then(function(core) {
			var serviceRegistry = core.serviceRegistry;
			var preferences = core.preferences;
			// Register services.  Unfortunately we currently must register everything we think our modules need, even if we don't directly
			// use them here.
			// See https://bugs.eclipse.org/bugs/show_bug.cgi?id=337740
			var operationsClient = new mOperationsClient.OperationsClient(serviceRegistry);
			var statusService = new mStatus.StatusReportingService(serviceRegistry, operationsClient, "statusPane", "notifications", "notificationArea"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			var commandRegistry = new mCommandRegistry.CommandRegistry({ });
			var progressService = new mProgress.ProgressService(serviceRegistry, operationsClient, commandRegistry);
			var fileClient = new mFileClient.FileClient(serviceRegistry);
			var searcher = new mSearchClient.Searcher({serviceRegistry: serviceRegistry, commandService: commandRegistry, fileService: fileClient});
			
			function fillMyPage () {
				// Many pages use the hash to determine the content.
				var parameters = PageUtil.matchResourceParameters();
				
				// Get our DOM id's so we can pass them to javascript components.
				var content = lib.$("#jira"); //$NON-NLS-0$
				console.log("jira id was detected");
				// Either create some kind of component to attach to content dom....
				// var myComponent = new mComponent.Component({node: content, ...other services and options....});
			 
				content.appendChild(document.createTextNode("test")); 
				
				 
			}
			
			// first parameter is page id from html.  These id's should ideally be unique across pages because the id may be used in
			// preferences, localStorage, etc. to save page-related UI state.
			mGlobalCommands.generateBanner("orion-singlepanepageid", serviceRegistry, commandRegistry, preferences, searcher); //$NON-NLS-0$
			window.addEventListener("hashchange", function() { fillMyPage(); }, false); //$NON-NLS-0$
			fillMyPage();
		});
});