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

package org.zanata.feature.search

import org.junit.jupiter.api.Test
import org.zanata.feature.Trace
import org.zanata.feature.testharness.DetailedTest
import org.zanata.feature.testharness.ZanataTestCase
import org.zanata.workflow.BasicWorkFlow
import org.zanata.workflow.LoginWorkFlow

import org.assertj.core.api.Assertions.assertThat

/**
 * @author Damian Jansen [djansen@redhat.com](mailto:djansen@redhat.com)
 */
@DetailedTest
class ProjectSearchTest : ZanataTestCase() {

    @Trace(summary = "The user can search for a project")
    @Test
    fun successfulProjectSearchAndDisplay() {
        val explorePage = BasicWorkFlow()
                .goToHome()
                .gotoExplore()
                .enterSearch("about")
                .expectProjectListContains("about fedora")

        assertThat(explorePage.projectSearchResults)
                .describedAs("Normal user can see the project")
                .contains("about fedora")

        val projectPage = explorePage.clickProjectEntry("about fedora")

        assertThat(projectPage.projectName.trim { it <= ' ' })
                .describedAs("The project page is the correct one")
                .isEqualTo("about fedora")
    }

    @Trace(summary = "The system will provide no results on an " +
            "unsuccessful search")
    @Test
    @Throws(Exception::class)
    fun unsuccessfulProjectSearch() {
        val explorePage = BasicWorkFlow()
                .goToHome()
                .gotoExplore()
                .enterSearch("arodef")

        assertThat(explorePage.projectSearchResults.isEmpty())
                .describedAs("No projects are displayed")
                .isTrue()
    }

    @Trace(summary = "The user cannot search for Deleted projects")
    @Test
    fun userCannotSearchDeleteProject() {
        LoginWorkFlow().signIn("admin", "admin")
                .gotoExplore()
                .searchAndGotoProjectByName("about fedora")
                .gotoSettingsTab()
                .gotoSettingsGeneral()
                .deleteProject()
                .enterProjectNameToConfirmDelete("about fedora")
                .confirmDeleteProject()
                .logout()

        val explorePage = BasicWorkFlow()
                .goToHome()
                .gotoExplore()
                .enterSearch("about")

        assertThat(explorePage.projectSearchResults.isEmpty())
                .describedAs("No projects are displayed")
                .isTrue()
    }

}