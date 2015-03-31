/*
 * Copyright 2014, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */
package org.zanata.page.utility;

import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.zanata.page.BasePage;

/**
 * @author Patrick Huang
 *         <a href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@Slf4j
public class HelpPage extends BasePage {

    private By contactAdminLink = By.linkText("Contact Admin");
    private By moreActions = By.className("dropdown__toggle");

    public HelpPage(WebDriver driver) {
        super(driver);
    }

    public HelpPage clickMoreActions() {
        log.info("Click More Actions");
        waitForWebElement(moreActions).click();
        return new HelpPage(getDriver());
    }

    public ContactAdminFormPage clickContactAdmin() {
        log.info("Click Contact Admin button");
        waitForWebElement(contactAdminLink).click();
        return new ContactAdminFormPage(getDriver());
    }
}