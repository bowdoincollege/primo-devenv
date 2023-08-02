<?xml version="1.0" encoding="utf-8"?>
<!-- modified by CSH, 08/2023 -->
<!-- this changes ALL letters that use title/author combo -->

<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


<xsl:template name="recordTitle">

			<!-- title -->
			<div class="recordTitle">
				<span class="spacer_after_1em">
				<!-- currently prints first 47 characters, can make longer/shorter if needed -->
				<xsl:value-of select="substring(notification_data/phys_item_display/title,1,47)"/></span>
			</div>
			<!-- author -->
			<xsl:if test="notification_data/phys_item_display/author !=''">
				<div class="">
					<span class="spacer_after_1em">
						<span class="recordAuthor">@@by@@ 
						<!-- currently prints first 42 characters, can make longer/shorter if needed -->
						<xsl:value-of select="substring(notification_data/phys_item_display/author,1,42)"/></span>
					</span>
				</div>
			</xsl:if>
			<!-- unchanged, doesn't print on the pull request slip currently -->
			<xsl:if test="notification_data/phys_item_display/issue_level_description !=''">
				<div class="">
					<span class="spacer_after_1em">
						<span class="volumeIssue">@@description@@ <xsl:value-of select="substring(notification_data/phys_item_display/issue_level_description,1,150)"/></span>
					</span>
				</div>
			</xsl:if>

</xsl:template>

</xsl:stylesheet>