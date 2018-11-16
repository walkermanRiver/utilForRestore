

function hierarchyFilterUtility(sColNameCurrent, aColNameParents){
	this.oHierarchyDep = {};
	this.sColNameCurrent = sColNameCurrent;
	this.aColNameParents = aColNameParents;
}
//oHierarchyDep is following format
// {
//   "docName": {
//     "status": 1,
//     "pendingChildren": {
//       "hir1": {
//         "status": 1,
//         "childNodes": [
//           "docName1",
//           "docName2"
//         ]
//       },
//       "hir2": {
//         "status": 1,
//         "childNodes": [
//           "docName3",
//           "docName4"
//         ]
//       }
//     }
//   }
// }
hierarchyFilterUtility.prototype._validateHierarchyNodeDependency = function(oHierarchyDep, sCurNodeName, sCurHierarchyName, sCurNodeStatus, aHierarchyName){

	//first make sure the currenct node exist in the check tree
	if(oHierarchyDep.hasOwnProperty(sCurNodeName) === false){
		oHierarchyDep[sCurNodeName] = {
			status: sCurNodeStatus, 
			pendingChildren: {			
			}			
		};
	}

	if(oHierarchyDep[sCurNodeName].pendingChildren.hasOwnProperty(sCurHierarchyName) === false){
		oHierarchyDep[sCurNodeName].pendingChildren[sCurHierarchyName] = {
			status : sCurNodeStatus,
			childNodes: []
		};
	}

	let oHierarchyDepNode = oHierarchyDep[sCurNodeName];
	let aHierarchyDepNodes = [oHierarchyDepNode];	
	let iHierarchyCount = aHierarchyName.length;	

	while(aHierarchyDepNodes.length > 0){
		let oHierarchyDepNode = aHierarchyDepNodes.shift();
		let oPendingChildren = oHierarchyDepNode.pendingChildren;
		// if(oPendingChildren.)

		let bInvalid = false;
		let bAllValid = true;
		let oNextDepNodes = {}; 
		if(sCurNodeStatus < oHierarchyDepNode.status){
			oHierarchyDepNode.status = sCurNodeStatus;
		}
		
		for(let iHierIndex=0; iHierIndex<iHierarchyCount; iHierIndex++){
			let sHierarchyName = aHierarchyName[iHierIndex];		

			if(oPendingChildren.hasOwnProperty(sHierarchyName)){
				let oPendingChildrenDepNode = oPendingChildren[sHierarchyName];
				if(sHierarchyName === sCurHierarchyName){					
					if(oPendingChildrenDepNode.status != OPERATECONS.VALIDATESTATUS.INVALID && sCurNodeStatus != oPendingChildrenDepNode.status){					
						oPendingChildrenDepNode.status = sCurNodeStatus;
						let iPendingChildrenNodeCount = childNodes.length;
						//here we must not remove the children, otherwise when new hierarchy is involved, we lose the children infomation to update them
						for(let iPendingChildRenNodeIndex=0; iPendingChildRenNodeIndex<iPendingChildrenNodeCount; iPendingChildRenNodeIndex++){
							oNextDepNodes[oPendingChildrenDepNode.childNodes[iPendingChildRenNodeIndex]] = true;
						}						
					}
					if(oPendingChildrenDepNode.status != OPERATECONS.VALIDATESTATUS.VALID){
						bAllValid = false;
					}
				}else{
					//if one node is explicitly invalid, then it can apply to its all children in all hierarchy
					if(sCurNodeStatus === OPERATECONS.VALIDATESTATUS.INVALID){
						bInvalid = true;
						oPendingChildrenDepNode.status = sCurNodeStatus;
						let iPendingChildrenNodeCount = childNodes.length;
						//here we must not remove the children, otherwise when new hierarchy is involved, we lose the children infomation to update them
						for(let iPendingChildRenNodeIndex=0; iPendingChildRenNodeIndex<iPendingChildrenNodeCount; iPendingChildRenNodeIndex++){
							oNextDepNodes[oPendingChildrenDepNode.childNodes[iPendingChildRenNodeIndex]] = true;
						}						
					}

					if(oPendingChildrenDepNode.status != OPERATECONS.VALIDATESTATUS.VALID){
						bAllValid = false;
					}
				}
			}else{
				//we do not know this hierarchy status, so the overall status should not be valid
				bAllValid = false;
				//we have make sure that when one node is checked, the parent node must be added, so this should not happen in this case
				// oPendingChildren[sHierarchyName] = {
				// 	status : OPERATECONS.VALIDATESTATUS.UNKNOWN,
				// 	childNodes: []
				// };
			}
		}

		if(bInvalid === true || bAllValid === true){
			for(let iHierIndex=0; iHierIndex<iHierarchyCount; iHierIndex++){
				let sHierarchyName = aHierarchyName[iHierIndex];
				let oPendingChildrenDepNode = oPendingChildren[sHierarchyName];
				//here we can remove the children infomation since we have got the node status
				while(oPendingChildrenDepNode.childNodes.length > 0){
					oNextDepNodes[oPendingChildrenDepNode.childNodes.shift()] = true;
				}					
			}			
		}

		for(sNextNode in oNextDepNodes){
			aHierarchyDepNodes.push(oHierarchyDep[sNextNode]);
		}

		if(bAllValid === true){
			oHierarchyDepNode.status = OPERATECONS.VALIDATESTATUS.VALID;
		}
		
	}

	return;
};

hierarchyFilterUtility.prototype._setAndValidateHierarchyNodeDependency = function(oHierarchyDep, sParentNodeName, sCurNodeName, sCurHierarchyName, aHierarchyName){
			
	let bHasParent = !!sParentNodeName;
	if(bHasParent === false){
		this._validateHierarchyNodeDependency(oHierarchyDep, sCurNodeName, sCurHierarchyName, OPERATECONS.VALIDATESTATUS.VALID, aHierarchyName );
		return;
	}

	if(oHierarchyDep.hasOwnProperty(sParentNodeName) === false){
		oHierarchyDep[sParentNodeName] = {
			status: OPERATECONS.VALIDATESTATUS.UNKNOWN, 
			pendingChildren: {			
			}			
		};
	}

	if(oHierarchyDep[sParentNodeName].pendingChildren.hasOwnProperty(sCurHierarchyName) === false){
		oHierarchyDep[sParentNodeName].pendingChildren[sCurHierarchyName] = {
			status : OPERATECONS.VALIDATESTATUS.UNKNOWN,
			childNodes: []
		}
	}

	oHierarchyDep[sParentNodeName].pendingChildren[sCurHierarchyName].childNodes.push(sCurNodeName);
	let sParentStatus = oHierarchyDep[sParentNodeName].pendingChildren[sCurHierarchyName].status;
	this._validateHierarchyNodeDependency(oHierarchyDep, sCurNodeName, sCurHierarchyName, sParentStatus, aHierarchyName );

	return;
};


hierarchyFilterUtility.prototype.buildTableRowsHierarchy = function(aTableBatchData){
	let iRowCount = aTableBatchData.length;
	let iParentColumnCount = this.aColNameParents.length;


	for(let iRowIndex=0; iRowIndex<iRowCount; iRowIndex++){
		let oRow = aTableBatchData[iRowIndex];
		//TBD we can hash the node key value later to reduce the memory cost
		let sCurRowNode = oRow[this.sColNameCurrent];
		for(let iParentColumnIndex=0; iParentColumnIndex<iParentColumnCount; iParentColumnIndex++){
			let sColNameParent = this.aColNameParents[iParentColumnIndex];
			let sParentRowNode = oRow[sColNameParent];
			this._setAndValidateHierarchyNodeDependency(this.oHierarchyDep, sParentRowNode, sCurRowNode, sColNameParent, this.aColNameParents);
		}		
	}

	return;
};

hierarchyFilterUtility.prototype.validateTableData = function(aTableBatchData){
	let oResultData = {};
	let aValidData = [];
	let aRejectData = [];
	let iRowCount = aTableBatchData.length;

	for(let iRowIndex=0; iRowIndex<iRowCount; iRowIndex++){
		let oRow = aTableBatchData[iRowIndex];
		//TBD we can hash the node key value later to reduce the memory cost
		let sCurRowNode = oRow[this.sColNameCurrent];
		if(this.oHierarchyDep.status === OPERATECONS.VALIDATESTATUS.VALID){
			aValidData.push(oRow);
		}else{
			aRejectData.push(oRow);
		}
	}

	oResultData["validData"] = aValidData;
	oResultData["rejectData"] = aRejectData;
	return oResultData;
};

exports.hierarchyValidator = hierarchyFilterUtility;