
function return_exec_result ( command ) {

     command = command || "ping -l 64 -n 10 -w 1 google.com" ;
	 
	var WshShell = new ActiveXObject("WScript.Shell");
	var oExec    = WshShell.Exec("%comspec% /c " + command);

	var wait = function (milisecs) {
			WshShell.Run("%comspec% /c ping localhost -n 1 -w " + (milisecs - 0), 0, true);
		}
	
	function ReadAllFromAny(oExec)
	{
		 if (!oExec.StdOut.AtEndOfStream)
			  return oExec.StdOut.ReadAll();

		 if (!oExec.StdErr.AtEndOfStream)
			  return "STDERR: " + oExec.StdErr.ReadAll();
		 
		 return -1;
	}

	var allInput = "" ;
	var tryCount = 0  ;

	while (true)
	{
		 var input = ReadAllFromAny(oExec);
		 if (-1 == input)
		 {
			  if (tryCount++ > 10 && oExec.Status == 1)
				   break;
			  wait(100);
		 }
		 else
		 {
			  allInput += input;
			  tryCount = 0;
		 }
	}
				return allInput ;
}