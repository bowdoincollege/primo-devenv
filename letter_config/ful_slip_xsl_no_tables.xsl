<?xml version="1.0" encoding="utf-8"?>

<!-- FUL RESOURCE REQUEST SLIP LETTER -->
<!-- CSH, 08/2023 -->

<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:include href="style.xsl" />

<xsl:include href="senderReceiver.xsl" />
<xsl:include href="mailReason.xsl" />
<xsl:include href="footer.xsl" />
<xsl:include href="recordTitle.xsl" />
<xsl:template match="/">

<html>

      <xsl:if test="notification_data/languages/string">
            <xsl:attribute name="lang">
                  <xsl:value-of select="notification_data/languages/string"/>
            </xsl:attribute>
      </xsl:if>

      <head>
            <title>
                  <xsl:value-of select="notification_data/general_data/subject"/>
            </title>

            <xsl:call-template name="generalStyle" />
      </head>

      <body>
            <div class="messageArea">
                  <div class="messageBody">
                        <table role='presentation' cellpadding="0">

                        <!-- requesting patron -->
                        <xsl:if test="notification_data/user_for_printing/name">
                              Patron: <strong><xsl:value-of select="notification_data/user_for_printing/name"/></strong><br />
                        </xsl:if>

                        <!--  request ID and barcode -->
                        Request ID: <xsl:value-of select="notification_data/request_id"/><br />

                        <!-- destination library -->
                        Send to: <strong><xsl:value-of select="notification_data/destination"/></strong><br /><br />

                        <!-- dates, one in each "column" -->
                        Date printed: 
                        <!-- spacing -->
                        <xsl:text> &#160; &#160; </xsl:text>
                        <xsl:text>Date received: </xsl:text> <br />
                        <!-- the date! -->
                        <xsl:value-of select="notification_data/general_data/current_date"/> <br />
                        <br />     

                        <!-- title and author; character limits stored in recordTitle.xsl -->
                        <xsl:call-template name="recordTitle" /> <br />

                        <!-- return to -->
                        Return to: Bowdoin - <xsl:value-of select="notification_data/item/owning_library_details/name"/>
                        <xsl:value-of select="notification_data/phys_item_display/location_name"/> <br />

                        <!-- call # and barcode-->
                        <xsl:if test="notification_data/phys_item_display/call_number != ''">
                              <strong><xsl:value-of select="notification_data/phys_item_display/call_number"/></strong> <br />
                              </xsl:if>
                        <strong>@@item_barcode@@: </strong><xsl:value-of select="notification_data/phys_item_display/barcode"/> <br />

                        <!-- notes, only prints if there ARE any notes -->
                        <xsl:if test="notification_data/request/note != ''">
                              <xsl:value-of select="substring(notification_data/request/note,1,100)"/><br />
                        </xsl:if>
                        </table>
                  </div>
            </div>

      </body>
</html>


</xsl:template>
</xsl:stylesheet>