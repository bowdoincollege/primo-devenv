<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


<xsl:include href="header.xsl" />
<xsl:include href="senderReceiver.xsl" />
<xsl:include href="mailReason.xsl" />
<xsl:include href="footer.xsl" />
<xsl:include href="style.xsl" />
<xsl:include href="recordTitle.xsl" />
<xsl:template match="/">
	<html>
		<head>
		<xsl:call-template name="generalStyle" />
		</head>

			<body>
			<br />
			&#160;
			<br />
			&#160;
			<br />
			&#160;
			<br />
			&#160;
			<br />

			<h1>
				<b><xsl:value-of select="notification_data/user_for_printing/name"/>
				</b>
			</h1>

			<div class="messageArea">
				<div class="messageBody">
					 <table cellspacing="0" cellpadding="5" border="0">
					 	<tr>
						<td>Date Received: <xsl:value-of select="notification_data/general_data/current_date"/></td>
						</tr>
						<tr><td>
							<h2><b>@@location@@: <xsl:value-of select="notification_data/phys_item_display/location_name"/></b></h2>
							<br />
							@@item_barcode@@: <xsl:value-of select="notification_data/phys_item_display/barcode"/> 
							<br />
							<xsl:call-template name="recordTitle" />
							<br />
							@@imprint@@: <xsl:value-of select="notification_data/phys_item_display/imprint"/>
							<br />
							@@call_number@@: <xsl:value-of select="notification_data/phys_item_display/call_number"/>
							<br />
							<b>@@request_note@@: </b> <xsl:value-of select="notification_data/request/note"/>
							<br />
							</td></tr>
						

						<tr>
							<td>
							@@requested_for@@: <xsl:value-of select="notification_data/user_for_printing/name"/>
							<br />
							@@move_to_library@@: <xsl:value-of select="notification_data/destination"/> 
							<br />
							@@request_type@@: <xsl:value-of select="notification_data/request_type"/>
							</td>
						</tr>
						<tr><td><xsl:value-of select="notification_data/letter_name"/></td></tr>
						<!--logo-->
						<tr>
						<td>
							<img src="cid:logo.jpg" alt="logo" width="200px" />
						</td>
						</tr>
					</table>
				</div>
			</div>

    

</body>
</html>


	</xsl:template>
</xsl:stylesheet>